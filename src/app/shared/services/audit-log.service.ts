import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { IAuditLog } from '../models/audit-log.model';
import { JwtAuthService } from './auth/jwt-auth.service'; // To get current user info

@Injectable({
  providedIn: 'root'
})
export class AuditLogService {
  private apiUrl = '/api/audit-logs'; // Placeholder API endpoint

  constructor(
    private http: HttpClient,
    private jwtAuthService: JwtAuthService
  ) { }

  private getCurrentUser(): { userId?: number | string, userDisplayName?: string } {
    const user = this.jwtAuthService.getUser();
    if (user) {
      // Assuming user object has 'id' and 'displayName' or similar properties
      // Adjust based on your actual IUser structure from jwtAuthService.getUser()
      return { userId: user.id, userDisplayName: user.displayName || user.name };
    }
    return { userDisplayName: 'System/Unknown' }; // Fallback if user info is not available
  }

  logAction(logData: Partial<IAuditLog>): Observable<any> {
    const currentUser = this.getCurrentUser();

    const logEntry: IAuditLog = {
      timestamp: new Date(),
      userId: logData.userId || currentUser.userId,
      userDisplayName: logData.userDisplayName || currentUser.userDisplayName,
      action: logData.action!,
      targetType: logData.targetType,
      targetId: logData.targetId,
      details: logData.details || null,
    };

    // For now, log to console and simulate backend call
    console.log('Audit Log:', logEntry);

    // Uncomment and adjust when backend endpoint is ready
    /*
    return this.http.post<any>(this.apiUrl, logEntry).pipe(
      tap(() => console.log('Audit log sent to backend successfully.')),
      catchError(error => {
        console.error('Failed to send audit log to backend:', error);
        return of(null); // Handle error gracefully, don't break the app
      })
    );
    */
    return of({ success: true, message: 'Logged to console.', entry: logEntry }).pipe(
      tap(() => console.log('Audit log action processed (console).'))
    );
  }

  // Optional: Method to fetch audit logs if needed by an admin interface
  getAuditLogs(filters?: any): Observable<IAuditLog[]> {
    // For now, return empty or mock data, as this is not the primary focus
    // return this.http.get<IAuditLog[]>(this.apiUrl, { params: filters });
    console.log('Fetching audit logs with filters:', filters);
    return of([]);
  }
}
