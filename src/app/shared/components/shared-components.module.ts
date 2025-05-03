import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {PerfectScrollbarModule} from 'ngx-perfect-scrollbar';
import {SearchModule} from '../search/search.module';
import {SharedPipesModule} from '../pipes/shared-pipes.module';
import {FlexLayoutModule} from '@angular/flex-layout';
import {SharedDirectivesModule} from '../directives/shared-directives.module';
import {ShopModule} from '../../views/shop/shop.module';

// Material Imports
import {MatBadgeModule} from "@angular/material/badge";
import {MatBottomSheetModule} from "@angular/material/bottom-sheet";
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import {MatCardModule} from "@angular/material/card";
import {MatChipsModule} from "@angular/material/chips";
import {MatRippleModule, MatNativeDateModule} from "@angular/material/core";
import {MatDialogModule} from "@angular/material/dialog";
import {MatDividerModule} from "@angular/material/divider";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatIconModule} from "@angular/material/icon";
import {MatPaginatorModule} from "@angular/material/paginator";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {MatSortModule} from "@angular/material/sort";
import {MatStepperModule} from "@angular/material/stepper";
import {MatTableModule} from "@angular/material/table";
import {MatTabsModule} from "@angular/material/tabs";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatTreeModule} from "@angular/material/tree";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatButtonModule} from "@angular/material/button";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatGridListModule} from "@angular/material/grid-list";
import {MatInputModule} from "@angular/material/input";
import {MatListModule} from "@angular/material/list";
import {MatMenuModule} from "@angular/material/menu";
import {MatRadioModule} from "@angular/material/radio";
import {MatSelectModule} from "@angular/material/select";
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatSliderModule} from "@angular/material/slider";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatMomentDateModule} from "@angular/material-moment-adapter";

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
import {AppErrorComponent} from '@services/app-error/app-error.component';
import {ButtonLoadingComponent} from './button-loading/button-loading.component';
import {EgretSidebarComponent, EgretSidebarTogglerDirective} from './egret-sidebar/egret-sidebar.component';
import {BottomSheetShareComponent} from './bottom-sheet-share/bottom-sheet-share.component';
import {EgretExampleViewerComponent} from './example-viewer/example-viewer.component';
import {EgretExampleViewerTemplateComponent} from './example-viewer-template/example-viewer-template.component';
import {DialogConfirmationComponent} from './dialog-confirmation/dialog-configrmation.component';
import {FileUploadModule} from 'ng2-file-upload';
import {DayOfWeekComponent} from './day-of-week/day-of-week.component';
import {CarouselComponent} from './carousel/carousel.component';
import {PayPopupComponent} from './pays/pay-popup/pay-popup.component';
import {ChangeStorePopupComponent} from './change-store-popup/change-store-popup.component';
import {ProviderItemComponent} from './provider-item/provider-item.component';

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
    ChangeStorePopupComponent,
    ProviderItemComponent
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
        ReactiveFormsModule,
        FileUploadModule,
        ShopModule,
        // Material Modules
        MatCheckboxModule,
        MatButtonModule,
        MatInputModule,
        MatAutocompleteModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatRadioModule,
        MatSelectModule,
        MatSliderModule,
        MatSlideToggleModule,
        MatMenuModule,
        MatSidenavModule,
        MatToolbarModule,
        MatListModule,
        MatGridListModule,
        MatCardModule,
        MatStepperModule,
        MatTabsModule,
        MatExpansionModule,
        MatButtonToggleModule,
        MatChipsModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatProgressBarModule,
        MatDialogModule,
        MatTooltipModule,
        MatSnackBarModule,
        MatTableModule,
        MatSortModule,
        MatPaginatorModule,
        MatNativeDateModule,
        MatMomentDateModule,
        MatTreeModule,
        MatRippleModule,
        MatBadgeModule,
        MatBottomSheetModule,
        MatDividerModule
    ],
    declarations: [
        components,
    ],
    // entryComponents: [AppComfirmComponent, AppLoaderComponent, BottomSheetShareComponent],
    exports: [
        components,
        // Material Modules
        MatCheckboxModule,
        MatButtonModule,
        MatInputModule,
        MatAutocompleteModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatRadioModule,
        MatSelectModule,
        MatSliderModule,
        MatSlideToggleModule,
        MatMenuModule,
        MatSidenavModule,
        MatToolbarModule,
        MatListModule,
        MatGridListModule,
        MatCardModule,
        MatStepperModule,
        MatTabsModule,
        MatExpansionModule,
        MatButtonToggleModule,
        MatChipsModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatProgressBarModule,
        MatDialogModule,
        MatTooltipModule,
        MatSnackBarModule,
        MatTableModule,
        MatSortModule,
        MatPaginatorModule,
        MatNativeDateModule,
        MatMomentDateModule,
        MatTreeModule,
        MatRippleModule,
        MatBadgeModule,
        MatBottomSheetModule,
        MatDividerModule
    ]
})
export class SharedComponentsModule {
}
