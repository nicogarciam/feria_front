import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PermissionService } from './permission.service';
import { AuditLogService } from '../audit-log.service';
import { IPermission } from '../../models/permission.model';
import { AuditLogAction } from '../../models/audit-log.model';
import { of } from 'rxjs';

describe('PermissionService', () => {
  let service: PermissionService;
  let httpMock: HttpTestingController;
  let mockAuditLogService: jasmine.SpyObj<AuditLogService>;

  const apiUrl = '/api/permissions';
  const targetType = 'Permission';

  beforeEach(() => {
    mockAuditLogService = jasmine.createSpyObj('AuditLogService', ['logAction']);
    mockAuditLogService.logAction.and.returnValue(of(null));

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        PermissionService,
        { provide: AuditLogService, useValue: mockAuditLogService }
      ]
    });
    service = TestBed.inject(PermissionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPermissions', () => {
    it('should retrieve all permissions via GET', () => {
      const mockPermissions: IPermission[] = [{ id: 1, name: 'CREATE_USER' }, { id: 2, name: 'EDIT_USER' }];
      service.getPermissions().subscribe(permissions => {
        expect(permissions.length).toBe(2);
        expect(permissions).toEqual(mockPermissions);
      });
      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockPermissions);
    });
  });

  describe('getPermissionById', () => {
    it('should retrieve a permission by ID via GET', () => {
      const mockPermission: IPermission = { id: 1, name: 'CREATE_USER' };
      const permissionId = 1;
      service.getPermissionById(permissionId).subscribe(permission => {
        expect(permission).toEqual(mockPermission);
      });
      const req = httpMock.expectOne(`${apiUrl}/${permissionId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPermission);
    });
  });

  describe('createPermission', () => {
    it('should create a permission via POST and log audit', () => {
      const newPermissionData: Partial<IPermission> = { name: 'DELETE_USER' };
      const createdPermission: IPermission = { id: 3, name: 'DELETE_USER' };

      service.createPermission(newPermissionData).subscribe(permission => {
        expect(permission).toEqual(createdPermission);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newPermissionData);
      req.flush(createdPermission);

      expect(mockAuditLogService.logAction).toHaveBeenCalledWith({
        action: AuditLogAction.PERMISSION_CREATED,
        targetType: targetType,
        targetId: createdPermission.id,
        details: { name: createdPermission.name }
      });
    });
  });

  describe('updatePermission', () => {
    it('should update a permission via PUT and log audit', () => {
      const permissionId = 1;
      const updatedPermissionData: Partial<IPermission> = { name: 'CREATE_ANY_USER' };
      const returnedPermission: IPermission = { id: permissionId, name: 'CREATE_ANY_USER' };

      service.updatePermission(permissionId, updatedPermissionData).subscribe(permission => {
        expect(permission).toEqual(returnedPermission);
      });

      const req = httpMock.expectOne(`${apiUrl}/${permissionId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedPermissionData);
      req.flush(returnedPermission);

      expect(mockAuditLogService.logAction).toHaveBeenCalledWith({
        action: AuditLogAction.PERMISSION_UPDATED,
        targetType: targetType,
        targetId: returnedPermission.id,
        details: { name: returnedPermission.name }
      });
    });
  });

  describe('deletePermission', () => {
    it('should delete a permission via DELETE and log audit', () => {
      const permissionId = 1;
      service.deletePermission(permissionId).subscribe(() => {
        // Success
      });

      const req = httpMock.expectOne(`${apiUrl}/${permissionId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);

      expect(mockAuditLogService.logAction).toHaveBeenCalledWith({
        action: AuditLogAction.PERMISSION_DELETED,
        targetType: targetType,
        targetId: permissionId
      });
    });
  });
});
