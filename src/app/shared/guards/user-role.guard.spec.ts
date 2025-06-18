import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { UserRoleGuard } from './user-role.guard';
import { JwtAuthService } from '../services/auth/jwt-auth.service';
import { IUser } from '../models/user.model';

describe('UserRoleGuard', () => {
  let guard: UserRoleGuard;
  let mockJwtAuthService: jasmine.SpyObj<JwtAuthService>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockActivatedRouteSnapshot = (data: any) => ({
    data: data
  } as ActivatedRouteSnapshot);

  const mockRouterStateSnapshot = {} as RouterStateSnapshot;

  beforeEach(() => {
    mockJwtAuthService = jasmine.createSpyObj('JwtAuthService', ['getUser']);
    mockSnackBar = jasmine.createSpyObj('MatSnackBar', ['open']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']); // Though not directly used by guard's canActivate logic to navigate

    TestBed.configureTestingModule({
      imports: [RouterTestingModule, MatSnackBarModule],
      providers: [
        UserRoleGuard,
        { provide: JwtAuthService, useValue: mockJwtAuthService },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: Router, useValue: mockRouter }
      ]
    });
    guard = TestBed.inject(UserRoleGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  // Scenario: User has required role and all required permissions
  it('should return true if user has a required role and all required permissions', () => {
    const mockUser: IUser = {
      id: 1,
      displayName: 'Test User',
      roles: [
        { name: 'Editor', permissions: [{ name: 'CREATE_POST' }, { name: 'EDIT_POST' }] }
      ] as any // Cast as any to match guard's assumption of rich role objects
    };
    mockJwtAuthService.getUser.and.returnValue(mockUser);
    const route = mockActivatedRouteSnapshot({ roles: ['Editor'], permissions: ['CREATE_POST', 'EDIT_POST'] });

    expect(guard.canActivate(route, mockRouterStateSnapshot)).toBeTrue();
    expect(mockSnackBar.open).not.toHaveBeenCalled();
  });

  // Scenario: User has required role but not all permissions
  it('should return false if user has a required role but not all permissions', () => {
    const mockUser: IUser = {
      id: 1,
      displayName: 'Test User',
      roles: [
        { name: 'Editor', permissions: [{ name: 'CREATE_POST' }] }
      ] as any
    };
    mockJwtAuthService.getUser.and.returnValue(mockUser);
    const route = mockActivatedRouteSnapshot({ roles: ['Editor'], permissions: ['CREATE_POST', 'DELETE_POST'] });

    expect(guard.canActivate(route, mockRouterStateSnapshot)).toBeFalse();
    expect(mockSnackBar.open).toHaveBeenCalledWith('You do not have all the required permissions for this page!', 'OK');
  });

  // Scenario: User does not have any of the required roles
  it('should return false if user does not have any of the required roles', () => {
    const mockUser: IUser = {
      id: 1,
      displayName: 'Test User',
      roles: [
        { name: 'Viewer', permissions: [] }
      ] as any
    };
    mockJwtAuthService.getUser.and.returnValue(mockUser);
    const route = mockActivatedRouteSnapshot({ roles: ['Editor', 'Admin'], permissions: ['CREATE_POST'] });

    expect(guard.canActivate(route, mockRouterStateSnapshot)).toBeFalse();
    expect(mockSnackBar.open).toHaveBeenCalledWith('You do not have the required role for this page!', 'OK');
  });

  // Scenario: Route has no specific roles/permissions defined (should pass if roles are not restrictive by default)
  it('should return true if route has no specific roles defined (permissions may still apply or be absent)', () => {
    const mockUser: IUser = {
      id: 1,
      displayName: 'Test User',
      roles: [ { name: 'Viewer', permissions: [] } ] as any
    };
    mockJwtAuthService.getUser.and.returnValue(mockUser);
    // Case 1: No roles, no permissions
    let route = mockActivatedRouteSnapshot({ roles: [], permissions: [] });
    expect(guard.canActivate(route, mockRouterStateSnapshot)).toBeTrue();

    // Case 2: No roles array, no permissions array
    route = mockActivatedRouteSnapshot({});
    expect(guard.canActivate(route, mockRouterStateSnapshot)).toBeTrue();

    // Case 3: Roles undefined, permissions undefined
     route = mockActivatedRouteSnapshot({ roles: undefined, permissions: undefined });
     expect(guard.canActivate(route, mockRouterStateSnapshot)).toBeTrue();
  });

  it('should return true if route requires roles, user has one, and no permissions are required', () => {
    const mockUser: IUser = {
      id: 1,
      displayName: 'Test User',
      roles: [ { name: 'Editor', permissions: [{name: 'CREATE_POST'}] } ] as any
    };
    mockJwtAuthService.getUser.and.returnValue(mockUser);
    const route = mockActivatedRouteSnapshot({ roles: ['Editor'] }); // No permissions key
    expect(guard.canActivate(route, mockRouterStateSnapshot)).toBeTrue();
  });


  // Scenario: User object is null or has no roles
  it('should return false if user object is null', () => {
    mockJwtAuthService.getUser.and.returnValue(null);
    const route = mockActivatedRouteSnapshot({ roles: ['Editor'], permissions: ['CREATE_POST'] });
    expect(guard.canActivate(route, mockRouterStateSnapshot)).toBeFalse();
    expect(mockSnackBar.open).toHaveBeenCalledWith('You are not logged in or have no assigned roles!', 'OK');
  });

  it('should return false if user object has no roles array', () => {
    const mockUser: IUser = { id: 1, displayName: 'Test User' } as any; // No roles property
    mockJwtAuthService.getUser.and.returnValue(mockUser);
    const route = mockActivatedRouteSnapshot({ roles: ['Editor'] });
    expect(guard.canActivate(route, mockRouterStateSnapshot)).toBeFalse();
    expect(mockSnackBar.open).toHaveBeenCalledWith('You are not logged in or have no assigned roles!', 'OK');
  });

  it('should return false if user object has empty roles array and roles are required', () => {
    const mockUser: IUser = { id: 1, displayName: 'Test User', roles: [] };
    mockJwtAuthService.getUser.and.returnValue(mockUser);
    const route = mockActivatedRouteSnapshot({ roles: ['Editor'] });
    expect(guard.canActivate(route, mockRouterStateSnapshot)).toBeFalse();
    expect(mockSnackBar.open).toHaveBeenCalledWith('You do not have the required role for this page!', 'OK');
  });

  // Scenario: User has a role that is required, but that role has no permissions, and route requires permissions
  it('should return false if user role has no permissions, but route requires them', () => {
    const mockUser: IUser = {
      id: 1,
      displayName: 'Test User',
      roles: [
        { name: 'Editor', permissions: [] } // Editor role has no permissions
      ] as any
    };
    mockJwtAuthService.getUser.and.returnValue(mockUser);
    const route = mockActivatedRouteSnapshot({ roles: ['Editor'], permissions: ['CREATE_POST'] });

    expect(guard.canActivate(route, mockRouterStateSnapshot)).toBeFalse();
    expect(mockSnackBar.open).toHaveBeenCalledWith('You do not have all the required permissions for this page!', 'OK');
  });

  // Scenario: Route data is null or roles/permissions are undefined
   it('should return true if route.data is null (no restrictions)', () => {
    const mockUser: IUser = { id: 1, displayName: 'Test User', roles: [{ name: 'AnyRole' }] } as any;
    mockJwtAuthService.getUser.and.returnValue(mockUser);
    const route = { data: null } as ActivatedRouteSnapshot; // route.data is null
    expect(guard.canActivate(route, mockRouterStateSnapshot)).toBeTrue();
  });

  it('should return true if route.data.roles is undefined (no role restrictions)', () => {
    const mockUser: IUser = { id: 1, displayName: 'Test User', roles: [{ name: 'AnyRole', permissions: [{name: 'P1'}] }] } as any;
    mockJwtAuthService.getUser.and.returnValue(mockUser);
    const route = mockActivatedRouteSnapshot({ permissions: ['P1'] }); // roles is undefined
    expect(guard.canActivate(route, mockRouterStateSnapshot)).toBeTrue();
  });

  it('should return true if route.data.permissions is undefined (no permission restrictions, role check still applies)', () => {
    const mockUser: IUser = { id: 1, displayName: 'Test User', roles: [{ name: 'Editor' }] } as any;
    mockJwtAuthService.getUser.and.returnValue(mockUser);
    const route = mockActivatedRouteSnapshot({ roles: ['Editor'] }); // permissions is undefined
    expect(guard.canActivate(route, mockRouterStateSnapshot)).toBeTrue();
  });

  it('should return false if route.data.permissions is undefined but user lacks required role', () => {
    const mockUser: IUser = { id: 1, displayName: 'Test User', roles: [{ name: 'Viewer' }] } as any;
    mockJwtAuthService.getUser.and.returnValue(mockUser);
    const route = mockActivatedR
