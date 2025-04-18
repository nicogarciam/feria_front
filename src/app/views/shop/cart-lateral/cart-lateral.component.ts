import {Component, OnDestroy, OnInit} from '@angular/core';
import {egretAnimations} from "@animations/egret-animations";
import {CartItem} from "@models/cartItem";
import {CartService} from "@services/cart/cart.service";
import {CartQuery} from "@services/cart/cart.query";
import {Observable, Subscription} from "rxjs";
import {IProductState} from "@models/product-state.model";
import {HttpResponse} from "@angular/common/http";
import {ProductStateService} from "@services/entities/productState.service";
import {ISale, Sale} from "@models/sale.model";
import {IStore} from "@models/store.model";
import {JwtAuthService} from "@services/auth/jwt-auth.service";
import {SaleService} from "@services/entities/sale.service";
import {AppErrorService} from "@services/app-error/app-error.service";
import {AppLoaderService} from "@services/app-loader/app-loader.service";
import {TranslateService} from "@ngx-translate/core";
import {debounceTime, finalize, switchMap, tap} from "rxjs/operators";
import {CustomerService} from "@services/entities/customer.service";
import {FormControl, Validators} from "@angular/forms";
import {ICustomer} from "@models/customer.model";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {CustomerPopupComponent} from "@components/customer-popup/customer-popup.component";
import * as moment from "moment/moment";
import {DateAdapter, MAT_DATE_FORMATS} from "@angular/material/core";
import {APP_DATE_FORMATS, AppDateAdapter} from "@helpers/format-datepicker";

@Component({
    selector: 'app-cart-lateral',
    templateUrl: './cart-lateral.component.html',
    styleUrls: ['./cart-lateral.component.scss'],
    providers: [
        {provide: DateAdapter, useClass: AppDateAdapter},
        {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
    ],
    animations: [egretAnimations]
})
export class CartLateralComponent implements OnInit, OnDestroy {

    public getItemSub: Subscription[] = [];

    public cart: CartItem[];
    cart$: Observable<CartItem[]>;
    public total = 0;
    public subTotal = 0;
    public vat = 15;
    public cartEmpty = true;
    public store: IStore;
    loading = false;
    loadingCustomer = false;
    customer_search: FormControl;
    date_sale: FormControl;
    filteredCustomers: ICustomer[] = [];

    productStates: IProductState[] = [];
    sale: ISale;


    constructor(
        private cartService: CartService, private productStateService: ProductStateService,
        protected cartQuery: CartQuery, private jwtAuthService: JwtAuthService,
        private saleService: SaleService, private errorService: AppErrorService,
        private loader: AppLoaderService, private t: TranslateService,
        private customerService: CustomerService, private dialog: MatDialog
    ) {
        this.customer_search = new FormControl('', Validators.required);
        this.date_sale = new FormControl(moment(), Validators.required);
    }

    ngOnInit() {


        this.store = this.jwtAuthService.getStore();
        this.cart$ = this.cartQuery.selectAll();
        this.getStates();
        this.cart$.subscribe(carItems => {
            this.cart = carItems;
            this.cartEmpty = carItems?.length < 1;
            this.subTotal = 0;
            carItems.forEach(item => {
                this.subTotal += (item.product.price * item.data.quantity);
                this.total = this.subTotal + (this.subTotal * (15 / 100));
            })
        });

        this.getItemSub.push(this.customer_search.valueChanges
            .pipe(
                debounceTime(10),
                tap(() => this.loadingCustomer = true),
                switchMap(value => this.customerService.query({q: value})
                    .pipe(
                        finalize(() => this.loadingCustomer = true),
                    )
                )
            ).subscribe(
                (result) => {
                    this.loadingCustomer = false;
                    this.filteredCustomers = result.body
                },
                (error) => {
                    console.log('Error ', error);
                    this.loadingCustomer = false;
                },
            ));


        this.sale = new Sale({
            store_id: this.store.id
        });


    }

    removeProduct(cartItem) {
        this.cartService.remove(cartItem)
    }


    private getStates() {
        this.getItemSub.push(this.productStateService.query()
            .subscribe((res: HttpResponse<IProductState[]>) => {
                    (this.productStates = res.body || [])
                },
                (error) => {
                    console.log(error);
                }
            ));
    }

    changeItemProductState(event, item) {
        this.cartService.changeProductState({id: item.id, newStateId: event.value});
    };

    ngOnDestroy() {
        this.getItemSub.forEach(sub => sub.unsubscribe());
        this.getItemSub = [];
    }

    saveCart() {

        if (this.customer_search.invalid || this.date_sale.invalid) {
            this.customer_search.updateValueAndValidity();
            this.date_sale.updateValueAndValidity();
            return;
        }
        this.sale.date_sale = this.date_sale.value;

        this.sale = {
            ...this.sale,
            total_price: this.total,
            products: this.cart.map(item => item.product),
        };

        this.loading = true;
        this.loader.open("Guardando");
        if (this.sale.id) {

            this.getItemSub.push(this.saleService.update(this.sale).subscribe(b => {
                    this.loading = false;
                    this.loader.close();
                },
                error => {
                    this.loader.close();
                    this.errorService.error(error);
                    this.loading = false;
                }))
        } else {
            this.getItemSub.push(this.saleService.create(this.sale).subscribe(b => {
                    this.loading = false;
                    this.loader.close();
                },
                error => {
                    this.loader.close();
                    this.errorService.error(error);
                    this.loading = false;
                }))
        }

    }

    displayCustomerFn = (item?: ICustomer) => {
        if (item && item === 'new') {
            this.addCustomer({}, true);
        } else if (item) {
            this.sale.customer = item;
            return this.sale.customer.name + " - " + this.sale.customer.email;
        }
    }

    addCustomer(data: any = {}, isNew?) {
        const title = (isNew ? this.t.instant('new') : this.t.instant('update'))
            + '  ' + this.t.instant('customer');
        const dialogRef: MatDialogRef<any> = this.dialog.open(CustomerPopupComponent, {
            width: '850px',
            disableClose: true,
            data: {title: title, item: data}
        })
        dialogRef.afterClosed()
            .subscribe(res => {
                if (!res) {
                    return;
                } else {
                    this.sale.customer = res;
                    this.sale.customer_id = res.id;
                }
            })


    }
}
