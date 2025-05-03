import {NgModule, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
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
import {FlexLayoutModule} from '@angular/flex-layout';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';
import {FileUploadModule} from 'ng2-file-upload';
import {ConfigRoutes} from './store-config.routing';
import {StoreConfigComponent} from './store-config.component';
import {TranslateModule} from '@ngx-translate/core';
import {MatSelectModule} from '@angular/material/select';
import {SharedPipesModule} from '../../shared/pipes/shared-pipes.module';
import {SharedComponentsModule} from '../../shared/components/shared-components.module';
import {CurrencyMaskModule} from "ng2-currency-mask";
import {ColorPickerModule} from "ngx-color-picker";
import { BankAccountCrudComponent } from './bank-account/bank-account-crud/bank-account-crud.component';
import {CustomFormsModule} from "ngx-custom-validators";
import {DiscountCrudComponent} from "./discounts-admin/discount-crud/discount-crud.component";
import {ProductAdminComponent} from "./products-admin/product-admin.component";
import {ProductPopupComponent} from "./products-admin/product-popup/product-popup.component";
import {CategoryPopupComponent} from "./products-admin/category-popup/category-popup.component";
import {StoreSettingsComponent} from "./store-settings/store-settings.component";
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatDialogModule} from '@angular/material/dialog';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatSortModule} from '@angular/material/sort';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        MatListModule,
        MatIconModule,
        MatButtonModule,
        MatCardModule,
        MatMenuModule,
        MatSlideToggleModule,
        MatGridListModule,
        MatChipsModule,
        MatCheckboxModule,
        MatRadioModule,
        MatTabsModule,
        MatInputModule,
        MatProgressBarModule,
        FlexLayoutModule,
        NgxDatatableModule,
        FileUploadModule,
        RouterModule.forChild(ConfigRoutes),
        ReactiveFormsModule,
        MatSelectModule,
        TranslateModule,
        SharedPipesModule,
        SharedComponentsModule,
        CurrencyMaskModule,
        ColorPickerModule,
        CustomFormsModule,
        MatFormFieldModule,
        MatDialogModule,
        MatSnackBarModule,
        MatTooltipModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatDatepickerModule,
        MatNativeDateModule
    ],
    declarations: [
        StoreConfigComponent,
        StoreSettingsComponent,
        ProductAdminComponent, ProductPopupComponent, CategoryPopupComponent,
        BankAccountCrudComponent,
        DiscountCrudComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class StoreConfigModule {
}
