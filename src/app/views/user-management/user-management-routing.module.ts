import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RoleListComponent } from './role-list/role-list.component';
import { RoleEditorComponent } from './role-editor/role-editor.component';
import { PermissionListComponent } from './permission-list/permission-list.component';
import { UserListComponent } from './user-list/user-list.component';
import { UserRoleAssignerComponent } from './user-role-assigner/user-role-assigner.component';

const routes: Routes = [
  { path: 'roles', component: RoleListComponent },
  { path: 'roles/new', component: RoleEditorComponent },
  { path: 'roles/edit/:id', component: RoleEditorComponent },
  { path: 'permissions', component: PermissionListComponent },
  { path: 'users', component: UserListComponent },
  { path: 'users/:id/assign-roles', component: UserRoleAssignerComponent },
  { path: '', redirectTo: 'users', pathMatch: 'full' } // Default to user list
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserManagementRoutingModule { }
