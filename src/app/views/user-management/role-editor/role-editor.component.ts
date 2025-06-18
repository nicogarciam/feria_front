import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RoleService } from '../../../shared/services/entities/role.service';
import { PermissionService } from '../../../shared/services/entities/permission.service';
import { IRole } from '../../../shared/models/role.model';
import { IPermission } from '../../../shared/models/permission.model';
import { Observable, forkJoin, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-role-editor',
  templateUrl: './role-editor.component.html',
  styleUrls: ['./role-editor.component.scss']
})
export class RoleEditorComponent implements OnInit {
  roleForm: FormGroup;
  isEditMode = false;
  roleId: number | null = null;
  allPermissions$: Observable<IPermission[]>;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private roleService: RoleService,
    private permissionService: PermissionService,
    private snackBar: MatSnackBar
  ) {
    this.roleForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      permissions: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.allPermissions$ = this.permissionService.getPermissions();

    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (id) {
          this.isEditMode = true;
          this.roleId = +id;
          return forkJoin({
            role: this.roleService.getRoleById(+id),
            allPermissions: this.allPermissions$ // ensure permissions are loaded
          });
        }
        return forkJoin({ role: of(null), allPermissions: this.allPermissions$ });
      })
    ).subscribe(data => {
      if (this.isEditMode && data.role) {
        this.patchForm(data.role, data.allPermissions);
      } else {
        this.initializePermissions(data.allPermissions);
      }
    });
  }

  get permissionsFormArray(): FormArray {
    return this.roleForm.get('permissions') as FormArray;
  }

  private initializePermissions(allPermissions: IPermission[]): void {
    this.permissionsFormArray.clear();
    allPermissions.forEach(permission => {
      this.permissionsFormArray.push(this.fb.group({
        id: [permission.id],
        name: [permission.name],
        selected: [false]
      }));
    });
  }

  private patchForm(role: IRole, allPermissions: IPermission[]): void {
    this.roleForm.patchValue({
      id: role.id,
      name: role.name
    });
    this.permissionsFormArray.clear();
    allPermissions.forEach(permission => {
      const roleHasPermission = role.permissions?.some(rp => rp.id === permission.id);
      this.permissionsFormArray.push(this.fb.group({
        id: [permission.id],
        name: [permission.name],
        selected: [roleHasPermission]
      }));
    });
  }

  onSubmit(): void {
    if (this.roleForm.invalid) {
      return;
    }

    const formValue = this.roleForm.value;
    const selectedPermissions = formValue.permissions
      .filter((p: { selected: boolean; }) => p.selected)
      .map((p: { id: number; name: string}) => ({ id: p.id, name: p.name } as IPermission));

    const roleData: Partial<IRole> = {
      id: formValue.id,
      name: formValue.name,
      permissions: selectedPermissions
    };

    let saveObservable: Observable<IRole>;
    if (this.isEditMode && this.roleId !== null) {
      saveObservable = this.roleService.updateRole(this.roleId, roleData);
    } else {
      saveObservable = this.roleService.createRole(roleData);
    }

    saveObservable.subscribe({
      next: () => {
        this.snackBar.open(`Role ${this.isEditMode ? 'updated' : 'created'} successfully!`, 'OK', { duration: 3000 });
        this.router.navigate(['/user-management/roles']);
      },
      error: (err) => {
        this.snackBar.open(`Error ${this.isEditMode ? 'updating' : 'creating'} role.`, 'Close', { duration: 3000 });
        console.error(err);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/user-management/roles']);
  }
}
