import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RoleService } from './role.service';
import { AuditLogService } from '../audit-log.service';
import { IRole } from '../../models/role.model';
import { AuditLogAction } from '../../models/audit-log.model';
import { of } from 'rxjs';

describe('RoleService', () => {
  let service: RoleService;
  let httpMock: HttpTestingController;
  let mockAuditLogService: jasmine.SpyObj<AuditLogService>;

  const apiUrl = '/api/roles';
  const targetType = 'Role';

  beforeEach(() => {
    mockAuditLogService = jasmine.createSpyObj('AuditLogService', ['logAction']);
    mockAuditLogService.logAction.and.returnValue(of(null)); // Mock logAction to return an observable

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        RoleService,
        { provide: AuditLogService, useValue: mockAuditLogService }
      ]
    });
    service = TestBed.inject(RoleService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Make sure that there are no outstanding requests
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getRoles', () => {
    it('should retrieve all roles via GET', () => {
      const mockRoles: IRole[] = [{ id: 1, name: 'Admin' }, { id: 2, name: 'Editor' }];
      service.getRoles().subscribe(roles => {
        expect(roles.length).toBe(2);
        expect(roles).toEqual(mockRoles);
      });
      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockRoles);
    });
  });

  describe('getRoleById', () => {
    it('should retrieve a role by ID via GET', () => {
      const mockRole: IRole = { id: 1, name: 'Admin' };
      const roleId = 1;
      service.getRoleById(roleId).subscribe(role => {
        expect(role).toEqual(mockRole);
      });
      const req = httpMock.expectOne(`${apiUrl}/${roleId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockRole);
    });
  });

  describe('createRole', () => {
    it('should create a role via POST and log audit', () => {
      const newRoleData: Partial<IRole> = { name: 'Viewer' };
      const createdRole: IRole = { id: 3, name: 'Viewer', permissions: [] };

      service.createRole(newRoleData).subscribe(role => {
        expect(role).toEqual(createdRole);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newRoleData);
      req.flush(createdRole);

      expect(mockAuditLogService.logAction).toHaveBeenCalledWith({
        action: AuditLogAction.ROLE_CREATED,
        targetType: targetType,
        targetId: createdRole.id,
        details: { name: createdRole.name, permissions: createdRole.permissions?.map(p => p.id) }
      });
    });
  });

  describe('updateRole', () => {
    it('should update a role via PUT and log audit', () => {
      const roleId = 1;
      const updatedRoleData: Partial<IRole> = { name: 'Super Admin' };
      const returnedRole: IRole = { id: roleId, name: 'Super Admin', permissions: [] };

      service.updateRole(roleId, updatedRoleData).subscribe(role => {
        expect(role).toEqual(returnedRole);
      });

      const req = httpMock.expectOne(`${apiUrl}/${roleId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedRoleData);
      req.flush(returnedRole);

      expect(mockAuditLogService.logAction).toHaveBeenCalledWith({
        action: AuditLogAction.ROLE_UPDATED,
        targetType: targetType,
        targetId: returnedRole.id,
        details: { name: returnedRole.name, permissions: returnedRole.permissions?.map(p => p.id) }
      });
    });
  });

  describe('deleteRole', () => {
    it('should delete a role via DELETE and log audit', () => {
      const roleId = 1;
      service.deleteRole(roleId).subscribe(() => {
        // Success
      });

      const req = httpMock.expectOne(`${apiUrl}/${roleId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null); // Respond with null for void observable

      expect(mockAuditLogService.logAction).toHaveBeenCalledWith({
        action: AuditLogAction.ROLE_DELETED,
        targetType: targetType,
        targetId: roleId
      });
    });
  });

  describe('addPermissionToRole', () => {
    it('should add a permission to a role via POST and log audit', () => {
      const roleId = 1;
      const permissionId = 101;
      const updatedRole: IRole = { id: roleId, name: 'Admin', permissions: [{id: permissionId, name: 'perm1'}] };

      service.addPermissionToRole(roleId, permissionId).subscribe(role => {
        expect(role).toEqual(updatedRole);
      });

      const req = httpMock.expectOne(`${apiUrl}/${roleId}/permissions/${permissionId}`);
      expect(req.request.method).toBe('POST');
      req.flush(updatedRole);

      expect(mockAuditLogService.logAction).toHaveBeenCalledWith({
        action: AuditLogAction.PERMISSION_ASSIGNED_TO_ROLE,
        targetType: targetType,
        targetId: roleId,
        details: { permissionId: permissionId, roleName: updatedRole.name }
      });
    });
  });

  describe('removePermissionFromRole', () => {
    it('should remove a permission from a role via DELETE and log audit', () => {
      const roleId = 1;
      const permissionId = 101;
      const updatedRole: IRole = { id: roleId, name: 'Admin', permissions: [] }; // Permissions now empty

      service.removePermissionFromRole(roleId, permissionId).subscribe(role => {
        expect(role).toEqual(updatedRole);
      });

      const req = httpMock.expectOne(`${apiUrl}/${roleId}/permissions/${permissionId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(updatedRole);

      expect(mockAuditLogService.logAction).toHaveBeenCalledWith({
        action: AuditLogAction.PERMISSION_REMOVED_FROM_ROLE,
        targetType: targetType,
        targetId: roleId,
        details: { permissionId: permissionId, roleName: updatedRole.name }
      });
    });
  });
});
