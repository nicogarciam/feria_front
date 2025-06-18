import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { RoleService } from '../../../shared/services/entities/role.service';
import { IRole } from '../../../shared/models/role.model';
import { IUser } from '../../../shared/models/user.model'; // Assuming IUser has roles as string[]
// import { UserService } from '../../../shared/services/entities/user.service'; // To fetch/update user
import { Observable, of } from 'rxjs'; // forkJoin might not be needed if we simplify the init logic
import { switchMap, map, tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuditLogService } from '../../../shared/services/audit-log.service'; // Import AuditLogService
import { AuditLogAction } from '../../../shared/models/audit-log.model'; // Import AuditLogAction

@Component({
  selector: 'app-user-role-assigner',
  templateUrl: './user-role-assigner.component.html',
  styleUrls: ['./user-role-assigner.component.scss']
})
export class UserRoleAssignerComponent implements OnInit {
  userRoleForm: FormGroup;
  userId: number | null = null;
  user: IUser | null = null; // Full user object
  initialUserRoles: string[] = []; // Store initial roles for comparison
  allRoles$: Observable<IRole[]>;

  // Mock UserService for now
  private mockUserService = {
    getUserById: (id: number): Observable<IUser | null> => {
      const mockUsers: IUser[] = [
        { id: 1, displayName: 'Admin User', email: 'admin@example.com', roles: ['Administrator', 'Editor'] },
        { id: 2, displayName: 'Editor User', email: 'editor@example.com', roles: ['Editor'] },
        { id: 3, displayName: 'Viewer User', email: 'viewer@example.com', roles: ['Viewer'] }
      ];
      const user = mockUsers.find(u => u.id === id);
      return of(user || null);
    },
    updateUserRoles: (userId: number, roleNames: string[]): Observable<IUser | null> => {
      console.log(`Mock save for user ${userId} with roles:`, roleNames);
      const mockUsers = [ // Re-declare or ensure accessible if this is a real service
        { id: 1, displayName: 'Admin User', email: 'admin@example.com', roles: ['Administrator', 'Editor'] },
        { id: 2, displayName: 'Editor User', email: 'editor@example.com', roles: ['Editor'] },
        { id: 3, displayName: 'Viewer User', email: 'viewer@example.com', roles: ['Viewer'] }
      ];
      const userIndex = mockUsers.findIndex(u => u.id === userId);
      if (userIndex > -1) {
        mockUsers[userIndex].roles = [...roleNames]; // Update the roles of the mock user
        return of({...mockUsers[userIndex]}); // Return a copy
      }
      return of(null);
    }
  };

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private roleService: RoleService,
    private auditLogService: AuditLogService, // Inject AuditLogService
    // private userService: UserService, // Inject when available
    private snackBar: MatSnackBar
  ) {
    this.userRoleForm = this.fb.group({
      roles: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.allRoles$ = this.roleService.getRoles();

    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (id) {
          this.userId = +id;
          return this.mockUserService.getUserById(+id); // Use actual service later
        }
        return of(null); // No ID, no user to fetch
      }),
      tap(user => { // This tap is for side-effects like setting component properties
        if (user) {
          this.user = user;
          this.initialUserRoles = [...(user.roles || [])]; // Store initial roles
        } else if (this.userId) { // If userId was set but user is null (not found)
          this.snackBar.open(`User with ID ${this.userId} not found.`, 'Close', { duration: 3000 });
          this.router.navigate(['/user-management/users']);
          // No user means initialUserRoles remains empty
        }
      }),
      // Combine user data (or null) with allRoles for form initialization
      // This switchMap ensures allRoles$ is subscribed to even if user is null
      switchMap(user =>
        this.allRoles$.pipe(
          map(allRoles => ({ user, allRoles })) // Pass user (even if null) and allRoles
        )
      )
    ).subscribe(data => {
      // Initialize form regardless of user, but use user's roles if user exists
      const currentUserRoles = data.user ? (data.user.roles || []) : [];
      this.initializeRolesFormArray(data.allRoles, currentUserRoles);
    });
  }

  get rolesFormArray(): FormArray {
    return this.userRoleForm.get('roles') as FormArray;
  }

  private initializeRolesFormArray(allRoles: IRole[], userRoleNames: string[]): void {
    this.rolesFormArray.clear();
    allRoles.forEach(role => {
      this.rolesFormArray.push(this.fb.group({
        id: [role.id],
        name: [role.name],
        selected: [userRoleNames.includes(role.name!)]
      }));
    });
  }

  onSubmit(): void {
    if (!this.userId || !this.user) return;

    const selectedRoleNames = this.userRoleForm.value.roles
      .filter((role: { selected: boolean; }) => role.selected)
      .map((role: { name: string; }) => role.name as string);

    // Determine changes for audit log
    const addedRoles = selectedRoleNames.filter(roleName => !this.initialUserRoles.includes(roleName));
    const removedRoles = this.initialUserRoles.filter(roleName => !selectedRoleNames.includes(roleName));

    // this.userService.updateUserRoles(this.userId, selectedRoleNames) // Use actual service
    this.mockUserService.updateUserRoles(this.userId, selectedRoleNames)
      .subscribe({
        next: (updatedUser) => {
          if (updatedUser) {
            this.snackBar.open(`User roles updated successfully for ${this.user?.displayName}!`, 'OK', { duration: 3000 });

            // Log the action
            if (addedRoles.length > 0 || removedRoles.length > 0) {
              this.auditLogService.logAction({
                action: AuditLogAction.USER_ROLES_CHANGED,
                targetType: 'User',
                targetId: this.userId,
                details: {
                  userDisplayName: this.user?.displayName,
                  addedRoles: addedRoles,
                  removedRoles: removedRoles
                }
              }).subscribe();
            }
            this.router.navigate(['/user-management/users']);
          } else {
            this.snackBar.open('Failed to update user roles: User not found after update.', 'Close', { duration: 3000 });
          }
        },
        error: (err) => {
          this.snackBar.open('Error updating user roles.', 'Close', { duration: 3000 });
          console.error(err);
        }
      });
  }

  cancel(): void {
    this.router.navigate(['/user-management/users']);
  }
}
