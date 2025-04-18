import { Routes } from '@angular/router';
import {ProductComponent} from "./product.component";
import {ProductViewComponent} from "./product-view/product-view.component";
import {ProductListComponent} from "./product-list/product-list.component";

export const BookingRoutes: Routes = [
  {
    path: '',
    component: ProductListComponent,
  },
  {
    path: 'view/:productID',
    component: ProductViewComponent
  }
];
