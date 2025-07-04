import {Component, OnInit, OnDestroy} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {egretAnimations} from "@animations/egret-animations";
import {ShopService} from '../shop.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {IProduct, Product} from '@models/product.model';
import {Subscription} from 'rxjs';
import {CartItem} from "@models/cartItem";

@Component({
    selector: 'app-product-details',
    templateUrl: './product-details.component.html',
    styleUrls: ['./product-details.component.scss'],
    animations: egretAnimations
})
export class ProductDetailsComponent implements OnInit, OnDestroy {
    public productID;
    public product: IProduct;
    public quantity = 1;
    public cart: CartItem[];
    public cartData: any;
    private productSub: Subscription;

    public photoGallery: any[] = [{url: '', state: '0'}];

    constructor(
        private shopService: ShopService,
        private route: ActivatedRoute,
        private snackBar: MatSnackBar
    ) {
    }

    ngOnInit() {
        this.productID = this.route.snapshot.params['id'];
        this.getProduct(this.productID);
        this.getCart();
        this.cartData = this.shopService.cartData;
    }

    ngOnDestroy() {
        this.productSub.unsubscribe();
    }

    getProduct(id) {
        this.productSub = this.shopService.getProductDetails(id)
            .subscribe(res => {
                this.product = res;
                this.initGallery(this.product)
            }, err => {
                this.product = {
                    id: null,
                    name: '',
                    price: 0
                };
            })
    }

    getCart() {
        this.shopService
            .getCart()
            .subscribe(cart => {
                this.cart = cart;
            })
    }

    addToCart() {
        const cartItem: CartItem = {
            product: this.product,
            data: {
                quantity: this.quantity,
                options: {}
            }
        };

        this.shopService
            .addToCart(cartItem)
            .subscribe(res => {
                this.cart = res;
                this.quantity = 1;
                this.snackBar.open('Product added to cart', 'OK', {duration: 4000});
            })
    }

    initGallery(product: IProduct) {
        if (!product.gallery) {
            return;
        }
        this.photoGallery = product.gallery.map(i => {
            return {
                url: i,
                state: '0'
            }
        });
        if (this.photoGallery[0]) {
            this.photoGallery[0].state = '1';
        }
    }

    changeState(photo) {
        if (photo.state === '1') {
            return;
        }
        this.photoGallery = this.photoGallery.map(p => {
            if (photo.url === p.url) {
                setTimeout(() => {
                    p.state = '1';
                    return p;
                }, 290)
            }
            p.state = '0';
            return p;
        })
    }

}
