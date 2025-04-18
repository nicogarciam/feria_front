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

  constructor(
    private ls: LocalStoreService, private http: HttpClient,
    private router: Router, private route: ActivatedRoute
  ) {
    this.route.queryParams
      .subscribe(params => this.return = params['return'] || '/');

    this.checkLocalStorage();
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
    this.store = this.getStore();
    this.store$.next(this.store);
  }

  public signout() {
    // this.setUserAndToken(null, null, false);
    this.cleanStorage();
    this.router.navigateByUrl("home");
  }

  isLoggedIn(): Boolean {
    // console.log("jwt-auth-service ", this.getJwtToken());
    return !!this.getJwtToken();
  }

  getJwtToken() {
    return this.ls.getItem(this.JWT_TOKEN);
  }
  getUser() {
    return this.ls.getItem(this.APP_USER);
  }


  setToken(token: String) {
    // console.log("setUserAndToken");
    this.token = token;
    this.ls.setItem(this.JWT_TOKEN, token);
  }

  setUserAndToken(token: String, user: IUser, isAuthenticated: Boolean) {
    // console.log("setUserAndToken");
    this.isAuthenticated = isAuthenticated;
    this.token = token;
    this.ls.setItem(this.JWT_TOKEN, token);
    this.setUser(user);
  }

  setUser(user: IUser) {
    this.user = user;
    this.user$.next(user);
    this.ls.setItem(this.APP_USER, user);
  }

  cleanStorage() {
    // console.log("setUserAndToken");

    this.isAuthenticated = false;
    this.token = null;
    this.user = null;
    this.user$.next(this.user);
    this.ls.clear();
    // this.ls.setItem(this.JWT_TOKEN, token);
    // this.ls.setItem(this.APP_USER, user);
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
    return 'Bearer ' + this.token;
  }
}
