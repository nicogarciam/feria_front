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
import {SaleComponent} from './sale.component';
import {SalesRoutes} from './sale.routing';
import {SharedPipesModule} from '../../shared/pipes/shared-pipes.module';
import {TranslateModule} from '@ngx-translate/core';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {DragToSelectModule} from "ngx-drag-to-select";
import {SelectorComponent} from "./selector/selector.component";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {SharedDirectivesModule} from "../../shared/directives/shared-directives.module";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatToolbarModule} from "@angular/material/toolbar";
import {PerfectScrollbarModule} from "ngx-perfect-scrollbar";
import {CurrencyMaskModule} from "ng2-currency-mask";
import {CustomerPopupComponent} from "@components/customer-popup/customer-popup.component";
import {SharedComponentsModule} from "@components/shared-components.module";
import {SalesListComponent} from "./sales-list/sales-list.component";
import {SaleViewComponent} from "./sale-view/sale-view.component";
import {SaleLateralFormComponent} from "./sale-lateral-form/sale-lateral-form.component";
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatDialogModule} from '@angular/material/dialog';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatSortModule} from '@angular/material/sort';
import {MatNativeDateModule} from '@angular/material/core';
import {MatDividerModule} from '@angular/material/divider';
import {SaleProductListComponent} from "./sale-product-list/sale-product-list.component";
import {SalePaysListComponent} from "./sale-pays-list/sale-pays-list.component";

@NgModule({
    imports: [
        DragToSelectModule.forRoot(),
        CommonModule,
        CurrencyMaskModule,
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
        SharedPipesModule,
        SharedDirectivesModule,
        RouterModule.forChild(SalesRoutes),
        TranslateModule,
        MatProgressSpinnerModule,
        MatDatepickerModule,
        ReactiveFormsModule,
        MatSelectModule,
        MatButtonToggleModule,
        MatProgressSpinnerModule,
        MatAutocompleteModule,
        MatExpansionModule,
        MatTooltipModule,
        MatToolbarModule,
        PerfectScrollbarModule,
        SharedComponentsModule,
        MatFormFieldModule,
        MatDialogModule,
        MatSnackBarModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatNativeDateModule,
        MatDividerModule
    ],
    exports: [
        SalesListComponent
    ],
    declarations: [SaleComponent, SelectorComponent, SalesListComponent,
        SaleViewComponent, CustomerPopupComponent, SaleLateralFormComponent, SaleProductListComponent,
    SalePaysListComponent]
})
export class SaleModule { }
