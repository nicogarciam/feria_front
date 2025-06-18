import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { IPermission, Permission } from '../../models/permission.model';
import { AuditLogService } from '../audit-log.service';
import { AuditLogAction, IAuditLog } from '../../models/audit-log.model';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private apiUrl = '/api/permissions'; // Placeholder API endpoint
  private targetType = 'Permission';

  constructor(private http: HttpClient, private auditLogService: AuditLogService) { }

  // Create a new permission
  createPermission(permissionData: Partial<IPermission>): Observable<IPermission> {
    return this.http.post<IPermission>(this.apiUrl, permissionData).pipe(
      tap(createdPermission => {
        this.auditLogService.logAction({
          action: AuditLogAction.PERMISSION_CREATED,
          targetType: this.targetType,
          targetId: createdPermission.id,
          details: { name: createdPermission.name }
        }).subscribe();
      })
    );
  }

  // Get all permissions
  getPermissions(): Observable<IPermission[]> {
    return this.http.get<IPermission[]>(this.apiUrl);
  }

  // Get a single permission by ID
  getPermissionById(id: number): Observable<IPermission> {
    return this.http.get<IPermission>(`${this.apiUrl}/${id}`);
  }

  // Update an existing permission
  updatePermission(id: number, permissionData: Partial<IPermission>): Observable<IPermission> {
    return this.http.put<IPermission>(`${this.apiUrl}/${id}`, permissionData).pipe(
      tap(updatedPermission => {
        this.auditLogService.logAction({
          action: AuditLogAction.PERMISSION_UPDATED,
          targetType: this.targetType,
          targetId: updatedPermission.id,
          details: { name: updatedPermission.name } // Log changed data
        }).subscribe();
      })
    );
  }

  // Delete a permission by ID
  deletePermission(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.auditLogService.logAction({
          action: AuditLogAction.PERMISSION_DELETED,
          targetType: this.targetType,
          targetId: id
        }).subscribe();
      })
    );
  }
}
