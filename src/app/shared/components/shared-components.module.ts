import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {SharedMaterialModule} from '../shared-material.module';
import {TranslateModule} from '@ngx-translate/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {PerfectScrollbarModule} from 'ngx-perfect-scrollbar';
import {SearchModule} from '../search/search.module';
import {SharedPipesModule} from '../pipes/shared-pipes.module';
import {FlexLayoutModule} from '@angular/flex-layout';
import {SharedDirectivesModule} from '../directives/shared-directives.module';

// ONLY REQUIRED FOR **SIDE** NAVIGATION LAYOUT
import {HeaderSideComponent} from './header-side/header-side.component';
import {SidebarSideComponent} from './sidebar-side/sidebar-side.component';

// ONLY REQUIRED FOR **TOP** NAVIGATION LAYOUT
import {HeaderTopComponent} from './header-top/header-top.component';
import {SidebarTopComponent} from './sidebar-top/sidebar-top.component';

// ONLY FOR DEMO
import {CustomizerComponent} from './customizer/customizer.component';

// ALWAYS REQUIRED
import {AdminLayoutComponent} from './layouts/admin-layout/admin-layout.component';
import {AuthLayoutComponent} from './layouts/auth-layout/auth-layout.component';
import {NotificationsComponent} from './notifications/notifications.component';
import {SidenavComponent} from './sidenav/sidenav.component';
import {FooterComponent} from './footer/footer.component';
import {BreadcrumbComponent} from './breadcrumb/breadcrumb.component';
import {AppComfirmComponent} from '@services/app-confirm/app-confirm.component';
import {AppLoaderComponent} from '@services/app-loader/app-loader.component';
import {ButtonLoadingComponent} from './button-loading/button-loading.component';
import {EgretSidebarComponent, EgretSidebarTogglerDirective} from './egret-sidebar/egret-sidebar.component';
import {BottomSheetShareComponent} from './bottom-sheet-share/bottom-sheet-share.component';
import {EgretExampleViewerComponent} from './example-viewer/example-viewer.component';
import {EgretExampleViewerTemplateComponent} from './example-viewer-template/example-viewer-template.component';
import {DialogConfirmationComponent} from './dialog-confirmation/dialog-configrmation.component';
import {FileUploadModule} from 'ng2-file-upload';
import {AgmCoreModule} from '@agm/core';
import {DayOfWeekComponent} from './day-of-week/day-of-week.component';
import {CarouselComponent} from './carousel/carousel.component';
import {PayPopupComponent} from './pays/pay-popup/pay-popup.component';
import {AppErrorComponent} from "@services/app-error/app-error.component";
import {ChangeStorePopupComponent} from "@components/change-store-popup/change-store-popup.component";
import {ShopModule} from "../../views/shop/shop.module";


const components = [
    HeaderTopComponent,
    SidebarTopComponent,
    SidenavComponent,
    NotificationsComponent,
    SidebarSideComponent,
    HeaderSideComponent,
    AdminLayoutComponent,
    AuthLayoutComponent,
    BreadcrumbComponent,
    AppComfirmComponent,
    AppLoaderComponent,
    AppErrorComponent,
    CustomizerComponent,
    ButtonLoadingComponent,
    EgretSidebarComponent,
    FooterComponent,
    EgretSidebarTogglerDirective,
    BottomSheetShareComponent,
    EgretExampleViewerComponent,
    EgretExampleViewerTemplateComponent,
    DialogConfirmationComponent,
    DayOfWeekComponent,
    CarouselComponent,
    PayPopupComponent,
    ChangeStorePopupComponent
]

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        TranslateModule,
        FlexLayoutModule,
        PerfectScrollbarModule,
        SearchModule,
        SharedPipesModule,
        SharedDirectivesModule,
        SharedMaterialModule,
        ReactiveFormsModule,
        FileUploadModule,
        AgmCoreModule.forRoot({
            apiKey: 'AIzaSyAdONJGSnCX3XRu6MKpTqDxQxOH4vRyRqw',
            libraries: ['places'],
            apiVersion: 'quarterly'
        }),
        ShopModule,

    ],
    declarations: [
        components,
    ],
    // entryComponents: [AppComfirmComponent, AppLoaderComponent, BottomSheetShareComponent],
    exports: [
        components
    ]
})
export class SharedComponentsModule {
}
