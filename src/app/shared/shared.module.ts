import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

// SERVICES
import {ThemeService} from '@services/theme.service';
import {NavigationService} from '@services/navigation.service';
import {RoutePartsService} from '@services/route-parts.service';
import {AuthGuard} from './guards/auth.guard';
import {UserRoleGuard} from './guards/user-role.guard';
import {AppConfirmService} from '@services/app-confirm/app-confirm.service';
import {AppLoaderService} from '@services/app-loader/app-loader.service';

import {SharedComponentsModule} from '@components/shared-components.module';
import {SharedPipesModule} from './pipes/shared-pipes.module';
import {SharedDirectivesModule} from './directives/shared-directives.module';
import {ImageService} from '@services/image.service';
import {CurrencyMaskModule} from "ng2-currency-mask";
import {AppErrorService} from "@services/app-error/app-error.service";
import {GoogleSigninService} from "@services/social/google-signin";
import {TranslateModule} from "@ngx-translate/core";
import {MatIconModule} from "@angular/material/icon";

@NgModule({
    imports: [
        CommonModule,
        SharedComponentsModule,
        SharedPipesModule,
        SharedDirectivesModule,
        CurrencyMaskModule,
        TranslateModule.forChild(),
        MatIconModule
    ],
    providers: [
        ThemeService,
        NavigationService,
        RoutePartsService,
        AuthGuard,
        UserRoleGuard,
        AppConfirmService,
        AppErrorService,
        AppLoaderService,
        ImageService,
        GoogleSigninService,
    ],
    declarations: [
    ],
    exports: [
        SharedComponentsModule,
        SharedPipesModule,
        SharedDirectivesModule,
        TranslateModule,
    ]
})
export class SharedModule {
}
