import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs'; // 'of' for mock data
import { IUser } from '../../../shared/models/user.model'; // Using existing IUser

// Mock UserService for now
// import { UserService } from '../../../shared/services/entities/user.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  users$: Observable<IUser[]>;
  displayedColumns: string[] = ['id', 'displayName', 'email', 'roles', 'actions']; // Example columns

  // constructor(private userService: UserService, private router: Router) { }
  constructor(private router: Router) { } // Temporary constructor

  ngOnInit(): void {
    // this.users$ = this.userService.getUsers();
    // Mock data for now, as UserService is not yet created
    const mockUsers: IUser[] = [
      { id: 1, displayName: 'Admin User', email: 'admin@example.com', roles: ['Administrator'] },
      { id: 2, displayName: 'Editor User', email: 'editor@example.com', roles: ['Editor'] },
      { id: 3, displayName: 'Viewer User', email: 'viewer@example.com', roles: ['Viewer'] }
    ];
    this.users$ = of(mockUsers);
  }

  assignRoles(user: IUser): void {
    // Navigate to a component for assigning roles to this user
    this.router.navigate(['/user-management/users', user.id, 'assign-roles']);
  }

  viewUserDetails(user: IUser): void {
    // Navigate to a user detail page (if one exists)
    // For now, could also be part of assign roles or a separate view
    console.log('View details for:', user.displayName);
     this.router.navigate(['/user-management/users', user.id, 'assign-roles']); // Or a dedicated detail view
  }
}
