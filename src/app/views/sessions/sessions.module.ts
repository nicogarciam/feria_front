import {PerfectScrollbarModule} from 'ngx-perfect-scrollbar';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {SharedMaterialModule} from 'app/shared/shared-material.module';

import {FlexLayoutModule} from '@angular/flex-layout';

// import { CommonDirectivesModule } from './sdirectives/common/common-directives.module';
import {ForgotPasswordComponent} from './forgot-password/forgot-password.component';
import {LockscreenComponent} from './lockscreen/lockscreen.component';
import {SigninComponent} from './signin/signin.component';
import {SignupComponent} from './signup/signup.component';
import {SessionsRoutes} from './sessions.routing';
import {NotFoundComponent} from './not-found/not-found.component';
import {ErrorComponent} from './error/error.component';
import {TranslateModule} from '@ngx-translate/core';
import {SigninDialogComponent} from './signin-dialog/signin-dialog.component';
import {SharedComponentsModule} from '../../shared/components/shared-components.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        SharedMaterialModule,
        FlexLayoutModule,
        PerfectScrollbarModule,
        RouterModule.forChild(SessionsRoutes),
        TranslateModule,
        SharedComponentsModule

    ],
  declarations: [ForgotPasswordComponent, LockscreenComponent, SigninComponent,
    SignupComponent, NotFoundComponent, ErrorComponent, SigninDialogComponent]
})
export class SessionsModule { }
