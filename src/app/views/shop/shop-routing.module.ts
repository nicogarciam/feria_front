import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ShopComponent } from './shop.component';
import { ShopProductsComponent } from './shop-products/shop-products.component';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { CartComponent } from './cart/cart.component';
import { CheckoutComponent } from './checkout/checkout.component';

const routes: Routes = [
    {
        path: '',
        component: ShopComponent,
        children: [
            {
                path: '',
                component: ShopProductsComponent
            },
            {
                path: 'shop-product/:id',
                component: ProductDetailsComponent,
                data: {title: 'Detail', breadcrumb: 'Detail'}
            },
            {
                path: 'cart',
                component: CartComponent,
                data: {title: 'Cart', breadcrumb: 'CART'}
            },
            {
                path: 'checkout',
                component: CheckoutComponent,
                data: {title: 'Checkout', breadcrumb: 'CHECKOUT'}
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ShopRoutingModule { }