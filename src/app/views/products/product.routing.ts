import { Routes } from '@angular/router';
import {ProductViewComponent} from "./product-view/product-view.component";
import {ProductListComponent} from "./product-list/product-list.component";
import {ProductAddComponent } from './product-add/product-add.component';
import {ProductComponent} from "./product.component";

export const ProductsRoutes: Routes = [
  {
    path: '',
    component: ProductListComponent,
    children: [
      {
        path: '',
        component: ProductListComponent,
      },
      {
        path: 'add',
        component: ProductAddComponent
      },
      {
        path: 'view/:productID',
        component: ProductViewComponent
      }
    ]
  }
];
