import { Routes } from '@angular/router';
import {SelectorComponent} from "./selector/selector.component";
import {SalesListComponent} from "./sales-list/sales-list.component";
import {SaleViewComponent} from "./sale-view/sale-view.component";

export const SalesRoutes: Routes = [
  {
    path: '',
    component: SalesListComponent,
  },
  {
    path: 'selector',
    component: SelectorComponent
  },
  {
    path: 'view/:saleID',
    component: SaleViewComponent
  }
];
