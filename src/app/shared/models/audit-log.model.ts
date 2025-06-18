export interface IAuditLog {
  id?: number; // Optional: if the backend assigns an ID
  timestamp: Date;
  userId?: number; // Or string for ID, adapt as per your auth system
  userDisplayName?: string; // For easier display
  action: string; // e.g., 'ROLE_CREATED', 'PERMISSION_DELETED', 'USER_ROLE_ASSIGNED'
  targetType?: string; // e.g., 'Role', 'Permission', 'User'
  targetId?: any; // ID of the entity that was affected
  details?: any; // JSON object or string for additional information
}

export class AuditLog implements IAuditLog {
  constructor(
    public timestamp: Date,
    public action: string,
    public userId?: number,
    public userDisplayName?: string,
    public targetType?: string,
    public targetId?: any,
    public details?: any,
    public id?: number,
  ) {
    if (!this.timestamp) {
      this.timestamp = new Date();
    }
  }
}

// Define some common action types
export const AuditLogAction = {
  // Role Actions
  ROLE_CREATED: 'ROLE_CREATED',
  ROLE_UPDATED: 'ROLE_UPDATED',
  ROLE_DELETED: 'ROLE_DELETED',
  PERMISSION_ASSIGNED_TO_ROLE: 'PERMISSION_ASSIGNED_TO_ROLE',
  PERMISSION_REMOVED_FROM_ROLE: 'PERMISSION_REMOVED_FROM_ROLE',

  // Permission Actions
  PERMISSION_CREATED: 'PERMISSION_CREATED',
  PERMISSION_UPDATED: 'PERMISSION_UPDATED',
  PERMISSION_DELETED: 'PERMISSION_DELETED',

  // User Actions
  USER_ROLE_ASSIGNED: 'USER_ROLE_ASSIGNED', // When a role is added to a user
  USER_ROLE_REMOVED: 'USER_ROLE_REMOVED',   // When a role is removed from a user
  USER_ROLES_CHANGED: 'USER_ROLES_CHANGED', // General for multiple changes

  // Could also add USER_LOGIN, USER_LOGOUT, etc. if needed
};
