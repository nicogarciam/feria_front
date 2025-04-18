import {throwError as observableThrowError, Observable} from 'rxjs';
import {Injectable} from '@angular/core';
import {IProduct} from '@models/product.model';
import {FormGroup} from '@angular/forms';

import {of, combineLatest} from 'rxjs';
import {startWith, debounceTime, delay, map, switchMap} from 'rxjs/operators';
import {CartItem} from "@models/cartItem";
import {ProductDB} from "../../shared/inmemory-db/products";


@Injectable()
export class ShopService {
    public products: any[] = [];
    public initialFilters = {
        minPrice: 10,
        maxPrice: 40
    };

    public cart: CartItem[] = [];
    public cartData = {
        itemCount: 0
    }

    constructor() {
    }

    public getCart(): Observable<CartItem[]> {
        return of(this.cart)
    }

    public addToCart(cartItem: CartItem): Observable<CartItem[]> {
        let index = -1;
        this.cart.forEach((item, i) => {
            if (item.product.id === cartItem.product.id) {
                index = i;
            }
        })
        if (index !== -1) {
            this.cart[index].data.quantity += cartItem.data.quantity;
            this.updateCount();
            return of(this.cart)
        } else {
            this.cart.push(cartItem);
            this.updateCount();
            return of(this.cart)
        }
    }

    private updateCount() {
        this.cartData.itemCount = 0;
        this.cart.forEach(item => {
            this.cartData.itemCount += item.data.quantity;
        })
    }

    public removeFromCart(cartItem: CartItem): Observable<CartItem[]> {
        this.cart = this.cart.filter(item => {
            if (item.product.id === cartItem.product.id) {
                return false;
            }
            return true;
        });
        this.updateCount();
        return of(this.cart)
    }

    public getProducts(): Observable<IProduct[]> {
        console.log("shop service");
        const productDB = new ProductDB();
        return of(productDB.products)
            .pipe(
                delay(500),
                map((data: IProduct[]) => {
                    this.products = data;
                    return data;
                })
            )
    }

    public getProductDetails(productID): Observable<IProduct> {
        const productDB = new ProductDB();
        const product = productDB.products.filter(p => p._id === productID)[0];
        if (!product) {
            return observableThrowError(new Error('Product not found!'));
        }
        return of(product)
    }

    public getCategories(): Observable<any> {
        const categories = ['speaker', 'headphone', 'watch', 'phone'];
        return of(categories);
    }

    public getFilteredProduct(filterForm: FormGroup): Observable<IProduct[]> {
        return combineLatest(
            this.getProducts(),
            filterForm.valueChanges
                .pipe(
                    startWith(this.initialFilters),
                    debounceTime(400)
                )
        )
            .pipe(
                switchMap(([products, filterData]) => {
                    return this.filterProducts(products, filterData);
                })
            )

    }

    /*
    * If your data set is too big this may raise performance issue.
    * You should implement server side filtering instead.
    */
    private filterProducts(products: IProduct[], filterData): Observable<IProduct[]> {
        const filteredProducts = products.filter(p => {
            const match = {
                search: false,
                caterory: false,
                price: false
            };
            // Search
            if (
                !filterData.search
                || p.name.toLowerCase().indexOf(filterData.search.toLowerCase()) > -1
                || p.description.indexOf(filterData.search) > -1
            ) {
                match.search = true;
            } else {
                match.search = false;
            }
            // Category filter
            if (
                filterData.category === p.category
                || !filterData.category
                || filterData.category === 'all'
            ) {
                match.caterory = true;
            } else {
                match.caterory = false;
            }
            // Price filter
            if (
                p.price >= filterData.minPrice
                && p.price <= filterData.maxPrice
            ) {
                match.price = true;
            } else {
                match.price = false;
            }


            for (const m in match) {
                if (!match[m]) {
                    return false;
                }
            }

            return true;
        })
        return of(filteredProducts)
    }
}
