import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuditLogService } from './audit-log.service';
import { JwtAuthService } from './auth/jwt-auth.service';
import { IAuditLog, AuditLogAction } from '../models/audit-log.model';
import { IUser } from '../models/user.model';

describe('AuditLogService', () => {
  let service: AuditLogService;
  let httpMock: HttpTestingController;
  let mockJwtAuthService: jasmine.SpyObj<JwtAuthService>;
  let consoleSpy: jasmine.Spy;

  const mockUser: IUser = { id: 1, displayName: 'Test User', name: 'Test User', roles: ['User'] };
  const mockApiUrl = '/api/audit-logs';

  beforeEach(() => {
    mockJwtAuthService = jasmine.createSpyObj('JwtAuthService', ['getUser']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuditLogService,
        { provide: JwtAuthService, useValue: mockJwtAuthService }
      ]
    });
    service = TestBed.inject(AuditLogService);
    httpMock = TestBed.inject(HttpTestingController);

    // Spy on console.log
    consoleSpy = spyOn(console, 'log').and.callThrough(); // Use callThrough to still see logs if needed
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('logAction', () => {
    it('should retrieve user info from JwtAuthService and construct log entry', () => {
      mockJwtAuthService.getUser.and.returnValue(mockUser);
      const logData: Partial<IAuditLog> = {
        action: AuditLogAction.ROLE_CREATED,
        targetType: 'Role',
        targetId: 123,
        details: { name: 'New Role' }
      };

      service.logAction(logData).subscribe(); // Service currently returns of(...)

      expect(mockJwtAuthService.getUser).toHaveBeenCalled();
      // Check that console.log was called with the constructed log entry
      expect(consoleSpy).toHaveBeenCalledWith('Audit Log:', jasmine.objectContaining({
        userId: mockUser.id,
        userDisplayName: mockUser.displayName,
        action: logData.action,
        targetType: logData.targetType,
        targetId: logData.targetId,
        details: logData.details,
        timestamp: jasmine.any(Date) // Timestamp will be generated, so check for type
      }));
    });

    it('should use provided userId and userDisplayName if available in logData', () => {
      mockJwtAuthService.getUser.and.returnValue(mockUser); // Still called, but overridden
      const providedUserId = 999;
      const providedDisplayName = 'System Process';
      const logData: Partial<IAuditLog> = {
        userId: providedUserId,
        userDisplayName: providedDisplayName,
        action: AuditLogAction.SYSTEM_EVENT,
      };

      service.logAction(logData).subscribe();

      expect(consoleSpy).toHaveBeenCalledWith('Audit Log:', jasmine.objectContaining({
        userId: providedUserId,
        userDisplayName: providedDisplayName,
        action: logData.action,
        timestamp: jasmine.any(Date)
      }));
    });

    it('should use fallback display name if JwtAuthService returns no user', () => {
      mockJwtAuthService.getUser.and.returnValue(null);
      const logData: Partial<IAuditLog> = { action: AuditLogAction.ROLE_DELETED };

      service.logAction(logData).subscribe();

      expect(consoleSpy).toHaveBeenCalledWith('Audit Log:', jasmine.objectContaining({
        userDisplayName: 'System/Unknown',
        action: logData.action,
        timestamp: jasmine.any(Date)
      }));
    });

    it('should default details to null if not provided', () => {
        mockJwtAuthService.getUser.and.returnValue(mockUser);
        const logData: Partial<IAuditLog> = {
          action: AuditLogAction.ROLE_CREATED,
          targetType: 'Role',
          targetId: 123
          // No details property
        };

        service.logAction(logData).subscribe();

        expect(consoleSpy).toHaveBeenCalledWith('Audit Log:', jasmine.objectContaining({
          details: null
        }));
      });

    // If HttpClient.post were active for audit logs:
    xit('should POST the log entry to the backend API (when enabled)', () => {
      mockJwtAuthService.getUser.and.returnValue(mockUser);
      const logData: Partial<IAuditLog> = { action: AuditLogAction.ROLE_CREATED, targetId: 1 };

      // To test this, you'd uncomment the http.post part in AuditLogService
      // For now, this test is expected to fail or be skipped if console logging is the primary path.
      service.logAction(logData).subscribe(response => {
        // expect(response).toBeTruthy(); // Or whatever the backend returns
      });

      const req = httpMock.expectOne(mockApiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(jasmine.objectContaining({
        action: logData.action,
        targetId: logData.targetId,
        userId: mockUser.id
      }));
      req.flush({ success: true }); // Mock backend response
    });
  });

  describe('getAuditLogs', () => {
    it('should call console.log and return an empty array for now', () => {
      service.getAuditLogs({}).subscribe(logs => {
        expect(logs).toEqual([]);
      });
      expect(consoleSpy).toHaveBeenCalledWith('Fetching audit logs with filters:', {});
    });

    // If HttpClient.get were active for getAuditLogs:
    xit('should GET audit logs from the backend API (when enabled)', () => {
        const mockLogs: IAuditLog[] = [
            { timestamp: new Date(), userId: 1, action: 'TEST_ACTION' }
        ];
        const filters = { page: 1 };
        service.getAuditLogs(filters).subscribe(logs => {
            expect(logs).toEqual(mockLogs);
        });

        const req = httpMock.expectOne(`${mockApiUrl}?page=1`); // Example with params
        expect(req.request.method).toBe('GET');
        req.flush(mockLogs);
    });
  });
});
