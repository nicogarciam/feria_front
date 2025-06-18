import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserManagementRoutingModule } from './user-management-routing.module';

// --- Angular Material Modules ---
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms'; // For RoleEditor

// --- Services ---
// RoleService & PermissionService are providedIn: 'root', so no need to provide here
// but they will be imported in components.

// --- Components ---
import { RoleListComponent } from './role-list/role-list.component';
import { RoleEditorComponent } from './role-editor/role-editor.component';
import { PermissionListComponent } from './permission-list/permission-list.component';
import { UserListComponent } from './user-list/user-list.component';
import { UserRoleAssignerComponent } from './user-role-assigner/user-role-assigner.component';

@NgModule({
  declarations: [
    RoleListComponent,
    RoleEditorComponent,
    PermissionListComponent,
    UserListComponent,
    UserRoleAssignerComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    UserManagementRoutingModule,
    ReactiveFormsModule,
    // Angular Material
    MatTableModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatIconModule,
    MatListModule,
    MatSelectModule,
  ],
  exports: [
    // Components that might be used outside this module (if any)
  ]
})
export class UserManagementModule { }
