import {AfterViewInit, ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {MatButton} from '@angular/material/button';
import {MatProgressBar} from '@angular/material/progress-bar';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Subject} from 'rxjs';
import {AppLoaderService} from '@services/app-loader/app-loader.service';
import {JwtAuthService} from '@services/auth/jwt-auth.service';
import {TranslateService} from '@ngx-translate/core';
import {StoreService} from '@services/entities/store.service';
import {HttpResponse} from '@angular/common/http';
import {IStore} from "@models/store.model";
import {environment} from "@environments/environment";
import {CredentialResponse} from "google-one-tap";

@Component({
    selector: 'app-signin',
    templateUrl: './signin.component.html',
    styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild(MatProgressBar) progressBar: MatProgressBar;
    @ViewChild(MatButton) submitButton: MatButton;

    signinForm: FormGroup;
    errorMsg = '';
    socialUser!: any;

    private gClientId = environment.googleClientId;


    private _unsubscribeAll: Subject<any>;
    ingresando = false;

    constructor(
        private jwtAuth: JwtAuthService, private egretLoader: AppLoaderService,
        private router: Router, private route: ActivatedRoute, private ref: ChangeDetectorRef,
        private loader: AppLoaderService, private translate: TranslateService, private _ngZone: NgZone,
        public hotelService: StoreService
    ) {
        this._unsubscribeAll = new Subject();
    }

    ngOnInit() {
        this.signinForm = new FormGroup({
            email: new FormControl('', Validators.required),
            password: new FormControl('', Validators.required),
            rememberMe: new FormControl(true)
        });

    }


    ngAfterViewInit() {
        this.autoSignIn();
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
                document.getElementById('buttonGoogleDiv'),
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

    ngOnDestroy() {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    signin() {
        const signinData = this.signinForm.value

        this.submitButton.disabled = true;
        this.progressBar.mode = 'indeterminate';

        this.jwtAuth.signin(signinData.email, signinData.password)
            .subscribe(response => {
                this.handleLogIn();
            }, err => {
                this.submitButton.disabled = false;
                this.progressBar.mode = 'determinate';
                this.errorMsg = err.error.error;
            })
    }

    async handleCredentialResponse(response: CredentialResponse) {
        this.ingresando = true;
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
        this.progressBar.mode = 'indeterminate';
        this.hotelService.myStores()
            .subscribe((res: HttpResponse<IStore[]>) => {
                    this.jwtAuth.setStore(res.body[0] || null);
                    this.egretLoader.close();
                    this.router.navigate([this.jwtAuth.return]);
                },
                (error) => {
                    console.log(error);
                    this.egretLoader.close();
                    this.router.navigate(['/my-profile']);
                }
            );
    }


    autoSignIn() {
        if (this.jwtAuth.return === '/') {
            return
        }

        this.egretLoader.open(this.translate.instant('auto.signing'), {width: '320px'});
        setTimeout(() => {
            this.signin();
            this.egretLoader.close()
        }, 2000);
    }


    public componentMethod(event) {
        event.target.select();
    }

    loginWithGoogle(): void {
        // this.googleSigninService.signin();
    }
}
