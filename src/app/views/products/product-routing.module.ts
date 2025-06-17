import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductComponent } from './product.component';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductAddComponent } from './product-add/product-add.component';
import { ProductViewComponent } from './product-view/product-view.component';
import {ProductEditComponent} from "./product-edit/product-edit.component";

const routes: Routes = [
    {
        path: '',
        component: ProductComponent,
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
            },
            {
                path: 'edit/:productID',
                component: ProductEditComponent
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ProductRoutingModule { }
