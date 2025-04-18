import {NgModule} from '@angular/core';
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
import {ChartsModule} from 'ng2-charts';
import {FileUploadModule} from 'ng2-file-upload';
import {ProductComponent} from './product.component';
import {BookingRoutes} from './product.routing';
import {SharedPipesModule} from '../../shared/pipes/shared-pipes.module';
import {TranslateModule} from '@ngx-translate/core';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {DragToSelectModule} from "ngx-drag-to-select";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {SharedDirectivesModule} from "../../shared/directives/shared-directives.module";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatToolbarModule} from "@angular/material/toolbar";
import {PerfectScrollbarModule} from "ngx-perfect-scrollbar";
import {CurrencyMaskModule} from "ng2-currency-mask";
import {SharedMaterialModule} from "../../shared/shared-material.module";
import {ProductListComponent} from "./product-list/product-list.component";
import {ProductViewComponent} from "./product-view/product-view.component";
import {ProductLateralFormComponent} from "./product-lateral-form/product-lateral-form.component";
import {SaleLateralFormComponent} from "../sales/sale-lateral-form/sale-lateral-form.component";

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
        ChartsModule,
        FileUploadModule,
        SharedPipesModule,
        SharedDirectivesModule,
        RouterModule.forChild(BookingRoutes),
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
        SharedMaterialModule
    ],
    declarations: [ProductComponent, ProductListComponent,
        ProductViewComponent, ProductLateralFormComponent, SaleLateralFormComponent]
})
export class ProductModule { }
