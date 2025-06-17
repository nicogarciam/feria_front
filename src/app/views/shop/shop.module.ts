import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms'
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgxPaginationModule } from 'ngx-pagination';

import { ShopProductsComponent } from './shop-products/shop-products.component';
import { ShopService } from './shop.service';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { CartComponent } from './cart/cart.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { SharedDirectivesModule } from 'app/shared/directives/shared-directives.module';
import {TranslateModule} from "@ngx-translate/core";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {ShopComponent} from "./shop.component";
import {ShopRoutingModule} from "./shop-routing.module";

@NgModule({
    imports: [
        CommonModule,
        ShopRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        FlexLayoutModule,
        MatIconModule,
        MatButtonModule,
        MatCardModule,
        MatMenuModule,
        MatSlideToggleModule,
        MatChipsModule,
        MatCheckboxModule,
        MatRadioModule,
        MatRippleModule,
        MatTabsModule,
        MatInputModule,
        MatSelectModule,
        MatSliderModule,
        MatExpansionModule,
        MatSnackBarModule,
        MatListModule,
        MatSidenavModule,
        NgxPaginationModule,
        NgxDatatableModule,
        SharedDirectivesModule,
        TranslateModule,
        MatAutocompleteModule,
        MatProgressSpinnerModule,
        MatDatepickerModule
    ],
    declarations: [
        ShopComponent,  // Añade el nuevo componente
        ShopProductsComponent,
        ProductDetailsComponent,
        CartComponent, CheckoutComponent
    ],
    exports: [
        CartComponent
    ],
    providers: [ShopService]
})
export class ShopModule {
}
