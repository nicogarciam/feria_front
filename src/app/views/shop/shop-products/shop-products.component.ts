import {Component, OnInit, OnDestroy, ViewChild} from '@angular/core';
import {MatSidenav} from '@angular/material/sidenav';
import {MatSnackBar} from '@angular/material/snack-bar';
import {IProduct, Product} from '@models/product.model';
import {FormBuilder, FormGroup, FormControl} from '@angular/forms'
import {Subscription, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {egretAnimations} from '@animations/egret-animations';
import {AppLoaderService} from '@services/app-loader/app-loader.service';
import {CartItem} from "@models/cartItem";
import {ShopService} from "../shop.service";
import {CartAnimationService} from "@services/cart/cart-animation.service";

@Component({
    selector: 'app-shop-products',
    templateUrl: './shop-products.component.html',
    styleUrls: ['./shop-products.component.scss'],
    animations: [egretAnimations]
})
export class ShopProductsComponent implements OnInit, OnDestroy {
    public isSideNavOpen: boolean;
    public viewMode = 'grid-view';
    public currentPage: any;
    @ViewChild(MatSidenav) private sideNav: MatSidenav;

    public products$: Observable<IProduct[]>;
    public categories$: Observable<any>;
    public activeCategory = 'all';
    public filterForm: FormGroup;
    public cart: CartItem[];
    public cartData: any;

    constructor(
        private fb: FormBuilder, private snackBar: MatSnackBar,
        private loader: AppLoaderService,
        private shopService: ShopService, private cartAnimationService: CartAnimationService
    ) {
    }

    ngOnInit() {
        this.categories$ = this.shopService.getCategories();
        this.buildFilterForm(this.shopService.initialFilters);

        setTimeout(() => {
            this.loader.open();
        });
        this.products$ = this.shopService
            .getFilteredProduct(this.filterForm)
            .pipe(
                map(products => {
                    this.loader.close();
                    return products;
                })
            );
        this.getCart();
        this.cartData = this.shopService.cartData;
    }

    ngOnDestroy() {

    }

    getCart() {
        this.shopService
            .getCart()
            .subscribe(cart => {
                this.cart = cart;
            })
    }

    addToCart(product) {
        const cartItem: CartItem = {
            product: product,
            data: {
                quantity: 1
            }
        };
        this.shopService
            .addToCart(cartItem)
            .subscribe(cart => {
                this.cart = cart;
                this.snackBar.open('Se agrego el Producto al carro', 'OK', {duration: 4000});
            })
    }

    buildFilterForm(filterData: any = {}) {
        this.filterForm = this.fb.group({
            search: this.fb.control(''),
            category: this.fb.control('all'),
            minPrice: this.fb.control(filterData.minPrice),
            maxPrice: this.fb.control(filterData.maxPrice)
        })
    }

    setActiveCategory(category) {
        this.activeCategory = category;
        this.filterForm.controls['category'].setValue(category)
    }

    toggleSideNav() {
        this.sideNav.opened = !this.sideNav.opened;
    }
}
