import {PerfectScrollbarModule} from 'ngx-perfect-scrollbar';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';

import {FlexLayoutModule} from '@angular/flex-layout';

// Material Imports
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatChipsModule} from '@angular/material/chips';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatMenuModule} from '@angular/material/menu';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatRadioModule} from '@angular/material/radio';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatTabsModule} from '@angular/material/tabs';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatDialogModule} from '@angular/material/dialog';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatSortModule} from '@angular/material/sort';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {MatDividerModule} from '@angular/material/divider';

import {ForgotPasswordComponent} from './forgot-password/forgot-password.component';
import {LockscreenComponent} from './lockscreen/lockscreen.component';
import {SigninComponent} from './signin/signin.component';
import {SignupComponent} from './signup/signup.component';
import {SessionsRoutes} from './sessions.routing';
import {NotFoundComponent} from './not-found/not-found.component';
import {ErrorComponent} from './error/error.component';
import {TranslateModule} from '@ngx-translate/core';
import {SigninDialogComponent} from './signin-dialog/signin-dialog.component';
import {SharedComponentsModule} from '@components/shared-components.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        FlexLayoutModule,
        PerfectScrollbarModule,
        RouterModule.forChild(SessionsRoutes),
        TranslateModule,
        SharedComponentsModule,
        // Material Modules
        MatButtonModule,
        MatCardModule,
        MatCheckboxModule,
        MatChipsModule,
        MatGridListModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatMenuModule,
        MatProgressBarModule,
        MatRadioModule,
        MatSlideToggleModule,
        MatTabsModule,
        MatFormFieldModule,
        MatDialogModule,
        MatSnackBarModule,
        MatTooltipModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatDividerModule
    ],
    declarations: [ForgotPasswordComponent, LockscreenComponent, SigninComponent,
        SignupComponent, NotFoundComponent, ErrorComponent, SigninDialogComponent]
})
export class SessionsModule { }
