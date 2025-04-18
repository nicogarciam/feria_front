import {AfterViewInit, Component, NgZone, OnInit, ViewChild} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {MatProgressBar} from '@angular/material/progress-bar';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {CustomValidators} from 'ngx-custom-validators';
import {AccountService} from '@services/entities/account.service';
import {Observable} from 'rxjs';
import {HttpResponse} from '@angular/common/http';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {AppLoaderService} from '@services/app-loader/app-loader.service';
import {Account, IAccount} from '@models/account.model';
import {User} from '@models/user.model';
import {Router} from '@angular/router';
import {JwtAuthService} from '@services/auth/jwt-auth.service';
import {SigninDialogComponent} from '../signin-dialog/signin-dialog.component';
import {environment} from "@environments/environment";
import {CredentialResponse} from "google-one-tap";
import {TranslateService} from "@ngx-translate/core";
import {IStore} from "@models/store.model";
import {StoreService} from "@services/entities/store.service";

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit, AfterViewInit {
  @ViewChild(MatButton) submitButton: MatButton;
  mailAvailable = true;
  debouncer: any;

  private gClientId = environment.googleClientId;

  signupForm: FormGroup
  constructor(private accountService: AccountService,
              private dialog: MatDialog, private t: TranslateService,
              private snack: MatSnackBar, public hotelService: StoreService,
              private loader: AppLoaderService,
              private router: Router, private _ngZone: NgZone,
              private jwtAuth: JwtAuthService) {}

  ngOnInit() {
    const password = new FormControl('', Validators.required);
    const confirmPassword = new FormControl('', CustomValidators.equalTo(password));

    this.signupForm = new FormGroup({
      email: new FormControl('', [
          Validators.required,
        Validators.email],
          this.emailValidator),
      firstName: new FormControl(),
      lastName: new FormControl(),
      password: password,
      username: new FormControl(),
      confirmPassword: confirmPassword,
      agreed: new FormControl('', (control: FormControl) => {
        const agreed = control.value;
        if (!agreed) {
          return { agreed: true }
        }
        return null;
      })

    })
  }


  emailValidator = (control: FormControl): any => {
    return new Promise(resolve => {
      setTimeout(() => {

        this.accountService.validateEmail(control.value).subscribe((res) => {
          if (res.ok) {
            resolve(null);
          }
        }, (err) => {
          resolve({'email.already.taken': true});
        });

      }, 1000);

    });
  };

  signup() {
    this.loader.open(this.t.instant('signing.with.google'), {width: '320px'});
    const account = this.createFromForm();
    this.subscribeToSaveResponse(this.accountService.register(account));

    this.submitButton.disabled = true;
  }

  ngAfterViewInit() {
    // @ts-ignore
    window.onGoogleLibraryLoad = () => {
      // @ts-ignore
      google.accounts.id.initialize({
        client_id: this.gClientId,
        callback: this.handleCredentialResponse.bind(this),
        auto_select: false,
        cancel_on_tap_outside: true
      });
      // @ts-ignore
      google.accounts.id.renderButton(
          // @ts-ignore
          document.getElementById('buttonDiv'),
          {
            theme: 'outline',
            size: 'large',
            width: 600,
            text: 'continue_with',
            logo_alignment: 'left'
          }
      );
      // @ts-ignore
      google.accounts.id.prompt((notification: PromptMomentNotification) => {
      });
    };

  }

  async handleCredentialResponse(response: CredentialResponse) {
    this.loader.open(this.t.instant('signing.with.google'), {width: '320px'});
    await this.jwtAuth.signinWithGoogle(response.credential)
        .subscribe((x: any) => {
              this._ngZone.run(() => {
                this.handleLogIn();
              })
            },
            (error: any) => {
              console.log(error);
            }
        );
  }

  private handleLogIn() {
    this.loader.open(this.t.instant('signing.with.google'), {width: '320px'});
    this.hotelService.myStores()
        .subscribe((res: HttpResponse<IStore[]>) => {
              this.jwtAuth.setStore(res.body[0] || null);
              this.loader.close();
              this.router.navigate([this.jwtAuth.return]);
            },
            (error) => {
              console.log(error);
              this.loader.close();
              this.router.navigate(['/my-profile']);
            }
        );
  }


  protected subscribeToSaveResponse(result: Observable<HttpResponse<IAccount>>): void {
    result.subscribe(
        (res) => this.onRegisterSuccess(res.body),
        (error) => this.onRegisterError(error.error)
    );
  }

  protected onRegisterSuccess(account): void {
    this.loader.close();
    this.openDialog(account);
  }

  openDialog(account): void {
    const dialogRef = this.dialog.open(SigninDialogComponent, {
      width: '450px',
      panelClass: 'app-full-bleed-dialog',
      data: {name: account.name, email: account.email}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  protected onRegisterError(error): void {
    this.loader.close();
    this.submitButton.disabled = false;
    this.snack.open('Error: ' + error.message, 'Ups!', {duration: 4000})
  }


  private createFromForm(): IAccount {
    const user = {...new User(),
      username: this.signupForm.get(['username']).value,
      password: this.signupForm.get(['password'])!.value,
      email: this.signupForm.get(['email'])!.value
    }

    return {
      ...new Account(),
      email: this.signupForm.get(['email'])!.value,
      user: user,
      first_name: this.signupForm.get(['first_name'])!.value,
      last_name: this.signupForm.get(['last_name'])!.value

    };
  }


}
