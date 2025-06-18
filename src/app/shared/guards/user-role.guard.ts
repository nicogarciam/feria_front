import { Injectable } from "@angular/core";
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from "@angular/router";
import { JwtAuthService } from "../services/auth/jwt-auth.service";
import { MatSnackBar } from "@angular/material/snack-bar";
// Assuming IUser will be populated with detailed role objects for the guard's purpose for now.
// import { IUser } from '../models/user.model'; // May not be strictly IUser if populated
// import { Role } from '../models/role.model'; // For type hinting if needed

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(private router: Router, private jwtAuth: JwtAuthService, private snack: MatSnackBar) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const user = this.jwtAuth.getUser(); // Assume this user object has a 'roles' array,
                                       // where each role has 'name' and 'permissions' (array of objects with 'name')

    if (!user || !user.roles) {
      this.snack.open('You are not logged in or have no assigned roles!', 'OK');
      return false;
    }

    const requiredRoles: string[] = route.data.roles;
    const requiredPermissions: string[] = route.data.permissions;

    // Check if user has at least one of the required roles
    const userRolesNames = user.roles.map((role: any) => role.name); // any for now, assuming structure
    const hasRequiredRole = requiredRoles && requiredRoles.length > 0
      ? requiredRoles.some(roleName => userRolesNames.includes(roleName))
      : true; // If no roles are required, this check passes

    if (!hasRequiredRole) {
      this.snack.open('You do not have the required role for this page!', 'OK');
      return false;
    }

    // If no permissions are required, access is granted (if role check passed)
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // Check if the user, through their roles, has ALL required permissions
    // Only consider permissions from roles that are part of the requiredRoles for this route
    const relevantUserRoles = user.roles.filter((role: any) => requiredRoles ? requiredRoles.includes(role.name) : true);

    let userPermissions = new Set<string>();
    relevantUserRoles.forEach((role: any) => { // any for now
      if (role.permissions) {
        role.permissions.forEach((perm: any) => userPermissions.add(perm.name)); // any for now
      }
    });

    const hasAllRequiredPermissions = requiredPermissions.every(permName => userPermissions.has(permName));

    if (hasAllRequiredPermissions) {
      return true;
    } else {
      this.snack.open('You do not have all the required permissions for this page!', 'OK');
      return false;
    }
  }
}
