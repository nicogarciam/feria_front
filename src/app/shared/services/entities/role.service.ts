import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { IRole, Role } from '../../models/role.model';
import { AuditLogService } from '../audit-log.service';
import { AuditLogAction, IAuditLog } from '../../models/audit-log.model';
// IPermission might be needed if we are sending plain permission objects as part of role creation/update
// import { IPermission } from '../../models/permission.model';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private apiUrl = '/api/roles'; // Placeholder API endpoint
  private targetType = 'Role';

  constructor(private http: HttpClient, private auditLogService: AuditLogService) { }

  // Create a new role
  // The IRole payload might include an array of IPermission or just permission IDs
  createRole(roleData: Partial<IRole>): Observable<IRole> {
    return this.http.post<IRole>(this.apiUrl, roleData).pipe(
      tap(createdRole => {
        this.auditLogService.logAction({
          action: AuditLogAction.ROLE_CREATED,
          targetType: this.targetType,
          targetId: createdRole.id,
          details: { name: createdRole.name, permissions: createdRole.permissions?.map(p => p.id) }
        }).subscribe();
      })
    );
  }

  // Get all roles
  getRoles(): Observable<IRole[]> {
    return this.http.get<IRole[]>(this.apiUrl);
  }

  // Get a single role by ID
  getRoleById(id: number): Observable<IRole> {
    return this.http.get<IRole>(`${this.apiUrl}/${id}`);
  }

  // Update an existing role
  // The IRole payload might include an array of IPermission or just permission IDs
  updateRole(id: number, roleData: Partial<IRole>): Observable<IRole> {
    return this.http.put<IRole>(`${this.apiUrl}/${id}`, roleData).pipe(
      tap(updatedRole => {
        this.auditLogService.logAction({
          action: AuditLogAction.ROLE_UPDATED,
          targetType: this.targetType,
          targetId: updatedRole.id,
          details: { name: updatedRole.name, permissions: updatedRole.permissions?.map(p => p.id) } // Log changed data
        }).subscribe();
      })
    );
  }

  // Delete a role by ID
  deleteRole(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.auditLogService.logAction({
          action: AuditLogAction.ROLE_DELETED,
          targetType: this.targetType,
          targetId: id
        }).subscribe();
      })
    );
  }

  // --- Additional methods specific to roles and permissions ---

  // Assign a permission to a role
  addPermissionToRole(roleId: number, permissionId: number): Observable<IRole> {
    return this.http.post<IRole>(`${this.apiUrl}/${roleId}/permissions/${permissionId}`, {}).pipe(
      tap(updatedRole => {
        this.auditLogService.logAction({
          action: AuditLogAction.PERMISSION_ASSIGNED_TO_ROLE,
          targetType: this.targetType,
          targetId: roleId,
          details: { permissionId: permissionId, roleName: updatedRole.name }
        }).subscribe();
      })
    );
  }

  // Remove a permission from a role
  removePermissionFromRole(roleId: number, permissionId: number): Observable<IRole> {
    return this.http.delete<IRole>(`${this.apiUrl}/${roleId}/permissions/${permissionId}`).pipe(
      tap(updatedRole => { // Assuming API returns updated role, or void
        this.auditLogService.logAction({
          action: AuditLogAction.PERMISSION_REMOVED_FROM_ROLE,
          targetType: this.targetType,
          targetId: roleId,
          details: { permissionId: permissionId, roleName: updatedRole ? updatedRole.name : 'N/A' }
        }).subscribe();
      })
    );
  }
}
