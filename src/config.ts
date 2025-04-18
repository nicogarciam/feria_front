export const config = {
  apiUrl: 'http://localhost/alojar_api/public/api',
  authRoles: {
    sa: ['SA'], // Only Super Admin has access
    admin: ['SA', 'ADMIN'], // Only SA & Admin has access
    editor: ['SA', 'ADMIN', 'Editor'], // Only SA & Admin & Editor has access
    user: ['SA', 'ADMIN', 'Editor', 'User'], // Only SA & Admin & Editor & User has access
    guest: ['SA', 'ADMIN', 'Editor', 'User', 'Guest'] // Everyone has access
  }
}
