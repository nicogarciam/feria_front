import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { JwtAuthService } from './jwt-auth.service';
import { LocalStoreService } from '../local-store.service';
import { Router } from '@angular/router';
import { IUser, User } from '../../models/user.model';
import { environment } from '@environments/environment';

describe('JwtAuthService', () => {
  let service: JwtAuthService;
  let httpMock: HttpTestingController;
  let store: { [key: string]: any } = {}; // Mock localStorage
  let mockRouter: jasmine.SpyObj<Router>;

  const mockUser: IUser = { id: 1, displayName: 'Test User', name: 'Test User', email: 'test@user.com', roles: ['User'] };
  const adminUser: IUser = { id: 2, displayName: 'Admin User', name: 'Admin User', email: 'admin@user.com', roles: ['Admin', 'User'] };

  beforeEach(() => {
    store = {}; // Reset localStorage mock for each test
    mockRouter = jasmine.createSpyObj('Router', ['navigateByUrl']);

    spyOn(localStorage, 'getItem').and.callFake((key: string) => store[key] || null);
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => store[key] = value);
    spyOn(localStorage, 'removeItem').and.callFake((key: string) => delete store[key]);
    spyOn(localStorage, 'clear').and.callFake(() => store = {});

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule // RouterTestingModule.withRoutes([]) if you need to test navigation outcomes
      ],
      providers: [
        JwtAuthService,
        LocalStoreService, // Real LocalStoreService uses localStorage, which is mocked
        { provide: Router, useValue: mockRouter }
      ]
    });
    service = TestBed.inject(JwtAuthService);
    httpMock = TestBed.inject(HttpTestingController);

    // Initialize service state as it would be after construction (loads from LS)
    service.loadImpersonationState(); // Manually call as constructor logic might be complex to replicate fully
    service.checkLocalStorage();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Authentication (signin/signout)', () => {
    it('signin should set user and token', (done) => {
      const email = 'test@user.com';
      const password = 'password';
      const mockResponse = { token: 'test-token', user: mockUser };

      service.signin(email, password).subscribe(res => {
        expect(res).toEqual(mockResponse);
        expect(service.getUser()).toEqual(mockUser);
        expect(service.getJwtToken()).toBe('test-token');
        expect(service.isLoggedIn()).toBeTrue();
        done();
      });

      const req = httpMock.expectOne(`${environment.apiURL}/auth/authenticate`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });

    it('signout should clear user, token, and impersonation state', () => {
      // Setup initial logged-in state
      service.setUserAndToken('test-token', adminUser, true);
      service.startImpersonation('User'); // Start impersonation
      expect(service.isImpersonating).toBeTrue();

      service.signout();

      expect(service.getUser()).toBeNull(); // or new User() depending on reset behavior
      expect(service.getJwtToken()).toBeNull();
      expect(service.isLoggedIn()).toBeFalse();
      expect(service.isImpersonating).toBeFalse();
      expect(service.originalUser).toBeNull();
      expect(localStorage.getItem(service.JWT_TOKEN)).toBeNull();
      expect(localStorage.getItem(service.APP_USER)).toBeNull();
      expect(localStorage.getItem(service.ORIGINAL_APP_USER)).toBeNull();
      expect(localStorage.getItem(service.IS_IMPERSONATING)).toBeNull();
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/sessions/signin');
    });
  });

  describe('Impersonation', () => {
    beforeEach(() => {
      // Ensure a user is signed in before each impersonation test
      // For these tests, we'll set the adminUser as the current user directly.
      service.setUser(adminUser, false); // Set adminUser as the main logged-in user
      service.isImpersonating = false; // Ensure not impersonating at start of these tests
      service.originalUser = null;
      localStorage.removeItem(service.ORIGINAL_APP_USER);
      localStorage.removeItem(service.IS_IMPERSONATING);
    });

    it('canImpersonate should return true for admin, false for non-admin', () => {
      expect(service.canImpersonate()).toBeTrue(); // adminUser has 'Admin' role

      service.setUser(mockUser, false); // Switch to non-admin user
      expect(service.canImpersonate()).toBeFalse();
    });

    it('startImpersonation should work for admin', () => {
      const targetRole = 'User'; // Admin user also has 'User' role they can impersonate as

      let emittedUser: IUser | null = null;
      service.user$.subscribe(u => emittedUser = u);

      const result = service.startImpersonation(targetRole);
      expect(result).toBeTrue();
      expect(service.isImpersonating).toBeTrue();
      expect(service.originalUser).toEqual(adminUser);
      expect(service.getUser()?.roles).toEqual([targetRole]);
      expect(service.getUser()?.id).toBe(adminUser.id); // other details should be from originalUser
      expect(emittedUser?.roles).toEqual([targetRole]);
      expect(localStorage.getItem(service.IS_IMPERSONATING)).toBe('true');
      expect(JSON.parse(localStorage.getItem(service.ORIGINAL_APP_USER) || '{}')).toEqual(adminUser);
      expect(JSON.parse(localStorage.getItem(service.APP_USER) || '{}').roles).toEqual([targetRole]);
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/');
    });

    it('startImpersonation should not work for non-admin', () => {
      service.setUser(mockUser, false); // Set non-admin user

      const result = service.startImpersonation('Admin'); // Try to impersonate 'Admin'
      expect(result).toBeFalse();
      expect(service.isImpersonating).toBeFalse();
      expect(service.originalUser).toBeNull();
    });

    it('startImpersonation should switch from existing impersonation', () => {
      service.startImpersonation('User'); // Start as 'User'
      expect(service.getUser().roles).toEqual(['User']);

      const newTargetRole = 'Viewer'; // Assume Admin also has 'Viewer' or can impersonate any role from a list
      // For this test, let's add 'Viewer' to adminUser's actual roles for realism if needed by canImpersonate logic for each step
      // Or assume RoleService would provide 'Viewer' as an impersonable role.
      // For simplicity, we assume 'Viewer' is a valid target.
      // The current startImpersonation copies originalUser, so it doesn't re-check if originalUser can impersonate the *new* role.
      // It just checks if originalUser is Admin.

      const result = service.startImpersonation(newTargetRole);
      expect(result).toBeTrue();
      expect(service.isImpersonating).toBeTrue();
      expect(service.originalUser).toEqual(adminUser); // Original user remains the same
      expect(service.getUser().roles).toEqual([newTargetRole]); // User now impersonates 'Viewer'
    });


    it('stopImpersonation should restore original user', () => {
      service.startImpersonation('User');
      expect(service.isImpersonating).toBeTrue();

      let emittedUser: IUser | null = null;
      service.user$.subscribe(u => emittedUser = u);

      service.stopImpersonation();
      expect(service.isImpersonating).toBeFalse();
      expect(service.originalUser).toBeNull();
      expect(service.getUser()).toEqual(adminUser); // Back to adminUser
      expect(emittedUser).toEqual(adminUser);
      expect(localStorage.getItem(service.IS_IMPERSONATING)).toBeNull(); // or 'false' depending on removeItem vs setItem(false)
      expect(localStorage.getItem(service.ORIGINAL_APP_USER)).toBeNull();
      expect(JSON.parse(localStorage.getItem(service.APP_USER) || '{}')).toEqual(adminUser);
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/');
    });

    it('loadImpersonationState should restore state from localStorage', () => {
      // Simulate state in localStorage
      localStorage.setItem(service.IS_IMPERSONATING, 'true');
      localStorage.setItem(service.ORIGINAL_APP_USER, JSON.stringify(adminUser));
      const impersonatedUser: IUser = { ...adminUser, roles: ['User'] };
      localStorage.setItem(service.APP_USER, JSON.stringify(impersonatedUser));

      service.loadImpersonationState(); // This is called in constructor, call again to ensure it loads
      service.checkLocalStorage(); // This loads the APP_USER into service.user

      expect(service.isImpersonating).toBeTrue();
      expect(service.originalUser).toEqual(adminUser);
      expect(service.getUser()).toEqual(impersonatedUser);
    });

    it('loadImpersonationState should handle broken state (isImpersonating true but no originalUser)', () => {
        localStorage.setItem(service.IS_IMPERSONATING, 'true');
        localStorage.removeItem(service.ORIGINAL_APP_USER); // originalUser is missing
        localStorage.setItem(service.APP_USER, JSON.stringify(mockUser)); // Some user is set

        service.loadImpersonationState();

        expect(service.isImpersonating).toBeFalse(); // Should reset isImpersonating
        expect(service.originalUser).toBeNull();
    });

    it('signout should call stopImpersonation if impersonating', () => {
      spyOn(service, 'stopImpersonation').and.callThrough();
      service.startImpersonation('User'); // Start impersonation

      service.signout();
      expect(service.stopImpersonation).toHaveBeenCalledWith(false); // Called with navigate = false
    });
  });
});
