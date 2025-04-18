import {ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {MatButton} from '@angular/material/button';
import {MatProgressBar} from '@angular/material/progress-bar';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Subject} from 'rxjs';
import {AppLoaderService} from '../../../shared/services/app-loader/app-loader.service';
import {JwtAuthService} from '../../../shared/services/auth/jwt-auth.service';
import {TranslateService} from '@ngx-translate/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';


export interface SigninDialogData {
  email: string;
  name: string;
  user: any;
}

@Component({
  selector: 'app-signin-dialog',
  templateUrl: './signin-dialog.component.html',
  styleUrls: ['./signin-dialog.component.css']
})
export class SigninDialogComponent implements OnInit, OnDestroy {
  @ViewChild(MatButton) submitButton: MatButton;

  signinForm: FormGroup;
  errorMsg = '';
  loading = false;

  private _unsubscribeAll: Subject<any>;

  constructor(
    private jwtAuth: JwtAuthService,
    private egretLoader: AppLoaderService,
    public dialogRef: MatDialogRef<SigninDialogComponent>,
    private translate: TranslateService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: SigninDialogData
  ) {
    this._unsubscribeAll = new Subject();
  }

  ngOnInit() {
    this.signinForm = new FormGroup({
      email: new FormControl(this.data?.email, Validators.required),
      password: new FormControl('', Validators.required)
    });
  }

  ngOnDestroy() {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  signin() {
    this.loading = true;
    const signinData = this.signinForm.value

    this.submitButton.disabled = true;

    this.jwtAuth.signin(signinData.email, signinData.password)
    .subscribe(response => {
      this.data.user  = response.body;
      setTimeout(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }, 3000);
      this.router.navigateByUrl(this.jwtAuth.return);
      this.dialogRef.close();
    }, err => {
      this.submitButton.disabled = false;
      this.errorMsg = err.error.error;
    })
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
  public componentMethod( event ) { event.target.select(); }


}
