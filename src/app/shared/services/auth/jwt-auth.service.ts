import { Injectable } from "@angular/core";
import { LocalStoreService } from "../local-store.service";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import { Router, ActivatedRoute } from "@angular/router";
import { map, catchError, delay } from "rxjs/operators";
import {IUser, User} from '../../models/user.model';
import {of, BehaviorSubject, throwError, Observable} from "rxjs";
import { environment } from "@environments/environment";
import {Account, IAccount} from '../../models/account.model';
import {StoreService} from '../entities/store.service';
import {Store, IStore} from '@models/store.model';


@Injectable({
  providedIn: "root",
})
export class JwtAuthService {
  token;
  isAuthenticated: Boolean;
  user: IUser = new User();
  user$ = (new BehaviorSubject<User>(this.user));
  account: IAccount = new Account();
  account$ = (new BehaviorSubject<IAccount>(this.account));
  store: IStore = new Store();
  store$ = (new BehaviorSubject<IStore>(this.store));
  signingIn: Boolean;
  return: string;
  JWT_TOKEN = "JWT_TOKEN";
  APP_USER = "USER";
  USER_ACCOUNT = "ACCOUNT";
  USER_STORE = "STORE" ;
  ORIGINAL_APP_USER = "ORIGINAL_USER"; // For impersonation
  IS_IMPERSONATING = "IS_IMPERSONATING"; // For impersonation

  public originalUser: IUser | null = null;
  public isImpersonating: boolean = false;

  constructor(
    private ls: LocalStoreService, private http: HttpClient,
    private router: Router, private route: ActivatedRoute,
    // private roleService: RoleService // RoleService might be needed if we fetch role details
  ) {
    this.route.queryParams
      .subscribe(params => this.return = params['return'] || '/');

    this.loadImpersonationState(); // Load impersonation state first
    this.checkLocalStorage(); // Then load user, account, store
  }

  private loadImpersonationState() {
    this.isImpersonating = this.ls.getItem(this.IS_IMPERSONATING) || false;
    if (this.isImpersonating) {
      this.originalUser = this.ls.getItem(this.ORIGINAL_APP_USER);
      // If originalUser is not found in local storage while isImpersonating is true,
      // it's a broken state. Stop impersonation.
      if (!this.originalUser) {
        this.isImpersonating = false;
        this.ls.removeItem(this.IS_IMPERSONATING);
      }
    } else {
      this.originalUser = null;
      this.ls.removeItem(this.ORIGINAL_APP_USER); // Clean up if not impersonating
    }
  }

  public signin(email, password) {
    this.signingIn = true;
    return this.http.post(`${environment.apiURL}/auth/authenticate`, { email, password })
      .pipe(
        map((res: any) => {
          this.setUserAndToken(res.token, res.user, !!res);
          this.signingIn = false;
          return res;
        }),
        catchError((error) => {
          this.signingIn = false;
          return throwError(error);
        })
      );
  }

  signinWithGoogle(credential: string): Observable<any> {
    this.signingIn = true;
    return this.http.post(`${environment.apiURL}/auth/google_signin`, {credential}).pipe(
        map((res: any) => {
          this.setUserAndToken(res.token, res.user, !!res);
          this.signingIn = false;
          return res;
        }),
        catchError((error) => {
          this.signingIn = false;
          return throwError(error);
        })
    );
  }

  /*
    checkTokenIsValid is called inside constructor of
    shared/components/layouts/admin-layout/admin-layout.component.ts
  */
  public checkTokenIsValid() {

    return this.http.get(`${environment.apiURL}/me `)
      .pipe(
        map((res: any) => {
          // this.setToken(res.token);
          this.setUser(res);
          this.setAccount(res.account);
          // console.log(res);
        }),
        catchError((error) => {
          this.signout();
          return of(error);
        })
      );
  }

  public checkLocalStorage() {
    // User, account, store loading
    const storedUser = this.getUserFromLocalStorage(); // Use a specific method to avoid confusion
    if (storedUser) {
      this.user = storedUser;
      this.user$.next(this.user);
    }
    // Potentially load account and store based on the current user (impersonated or original)
    // This part might need adjustment depending on how account/store relate to impersonation
    this.account = this.getAccount();
    this.account$.next(this.account);
    this.store = this.getStore();
    this.store$.next(this.store);
  }

  public signout() {
    if (this.isImpersonating) {
      // If signing out while impersonating, we effectively stop impersonating
      // and sign out the original user.
      this.stopImpersonation(false); // false to prevent navigation before full signout
    }
    this.cleanStorage(); // Clears all user-related data including impersonation flags
    this.user = new User(); // Reset user object
    this.user$.next(this.user);
    this.isAuthenticated = false;
    this.token = null;
    this.router.navigateByUrl("/sessions/signin"); // Or your designated sign-in page
  }

  isLoggedIn(): Boolean {
    // console.log("jwt-auth-service ", this.getJwtToken());
    return !!this.getJwtToken();
  }

  getJwtToken() {
    // JWT token should always be the original user's token
    return this.ls.getItem(this.JWT_TOKEN);
  }

  // This method returns the current effective user (either original or impersonated)
  getUser(): IUser {
    return this.user; // this.user is already managed to be the impersonated or original user
  }

  // This specifically gets the user from local storage for initialization
  private getUserFromLocalStorage(): IUser | null {
    return this.ls.getItem(this.APP_USER);
  }


  setToken(token: String) {
    this.token = token;
    this.ls.setItem(this.JWT_TOKEN, token);
  }

  setUserAndToken(token: String, user: IUser, isAuthenticated: Boolean) {
    this.isAuthenticated = isAuthenticated;
    this.token = token; // This is the original user's token
    this.ls.setItem(this.JWT_TOKEN, token);
    this.setUser(user, false); // Store as the main user, not impersonating initially
  }

  // Modified setUser to distinguish between setting the main user and impersonated user
  private setUser(user: IUser, isImpersonationRelated: boolean = true) {
    this.user = user; // Update the active user object in the service
    this.user$.next(user);
    this.ls.setItem(this.APP_USER, user); // Store the current user (original or impersonated)

    if (!isImpersonationRelated) { // If setting a new main user (e.g. login), clear impersonation
        this.originalUser = null;
        this.isImpersonating = false;
        this.ls.removeItem(this.ORIGINAL_APP_USER);
        this.ls.removeItem(this.IS_IMPERSONATING);
    }
  }

  cleanStorage() {
    this.isAuthenticated = false;
    this.token = null;
    // this.user = new User(); // User will be reset in signout()
    // this.user$.next(this.user);
    this.ls.removeItem(this.JWT_TOKEN);
    this.ls.removeItem(this.APP_USER);
    this.ls.removeItem(this.USER_ACCOUNT);
    this.ls.removeItem(this.USER_STORE);
    this.ls.removeItem(this.ORIGINAL_APP_USER);
    this.ls.removeItem(this.IS_IMPERSONATING);
  }


  setAccount(account: IAccount) {
    this.account$.next(account);
    this.ls.setItem(this.USER_ACCOUNT, account);
  }

  getAccount() {
    return this.ls.getItem(this.USER_ACCOUNT);
  }

  setStore(hotel: IStore) {
    this.ls.setItem(this.USER_STORE, hotel);
  }

  getStore(): IStore {
    return this.ls.getItem(this.USER_STORE);
  }

  getAuthority() {
    // Should always use the original user's token for API calls
    return 'Bearer ' + this.getJwtToken();
  }

  // --- Impersonation Methods ---

  canImpersonate(): boolean {
    const currentUserForCheck = this.originalUser || this.user; // Check against the actual logged-in user
    // Simple check: user must exist and have 'Admin' role. Adjust as needed.
    // Assumes user.roles is string[] as per IUser model.
    return !!currentUserForCheck && !!currentUserForCheck.roles && currentUserForCheck.roles.includes('Admin');
  }

  startImpersonation(roleName: string): boolean {
    if (!this.canImpersonate()) {
      console.error("User does not have permission to impersonate.");
      return false;
    }

    if (this.isImpersonating && this.originalUser) {
        // Already impersonating, switch back to original user before starting new impersonation
        this.setUser(this.originalUser, true);
    } else if (!this.isImpersonating) {
        this.originalUser = { ...this.user }; // Store a copy of the current user
        this.ls.setItem(this.ORIGINAL_APP_USER, this.originalUser);
    }

    if (!this.originalUser) { // Should not happen if logic is correct
        console.error("Original user not set. Cannot start impersonation.");
        return false;
    }

    // Create a simplified impersonated user object
    // For this subtask, role details (like permissions) are not fully fetched.
    // The impersonated user retains their original ID, email, etc., but roles are overridden.
    const impersonatedUser: IUser = {
      ...this.originalUser, // Copy most details from the original user
      roles: [roleName], // Set only the impersonated role
      // If your IUser model expects rich role objects:
      // roles: [{ name: roleName, permissions: [] }] // This is a deviation from IUser string[]
      // For consistency with IUser having roles: string[], [roleName] is correct.
    };

    this.setUser(impersonatedUser, true); // Set current user to the impersonated one
    this.isImpersonating = true;
    this.ls.setItem(this.IS_IMPERSONATING, true);

    this.router.navigateByUrl('/'); // Navigate to dashboard/home
    return true;
  }

  stopImpersonation(navigate: boolean = true) {
    if (!this.isImpersonating || !this.originalUser) {
      this.isImpersonating = false;
      this.originalUser = null;
      this.ls.removeItem(this.ORIGINAL_APP_USER);
      this.ls.removeItem(this.IS_IMPERSONATING);
      return;
    }

    this.setUser(this.originalUser, true); // Restore original user
    this.originalUser = null;
    this.isImpersonating = false;
    this.ls.removeItem(this.ORIGINAL_APP_USER);
    this.ls.removeItem(this.IS_IMPERSONATING);

    if (navigate) {
      this.router.navigateByUrl('/'); // Navigate to dashboard/home
    }
  }
}
