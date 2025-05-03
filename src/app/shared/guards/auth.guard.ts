import { Injectable } from "@angular/core";
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from "@angular/router";
import { JwtAuthService } from "@services/auth/jwt-auth.service";

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private router: Router, private jwtAuth: JwtAuthService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

    console.log('AuthGuard - Checking route:', state.url);
    console.log('AuthGuard - Route Config:', route.routeConfig);
    console.log('AuthGuard - Is Logged In:', this.jwtAuth.isLoggedIn());



    if (this.jwtAuth.isLoggedIn()) {
      return true;
    } else {
      this.router.navigate(["/sessions/signin"], {
        queryParams: {
          return: state.url
        }
      });
      return false;
    }
  }
}
