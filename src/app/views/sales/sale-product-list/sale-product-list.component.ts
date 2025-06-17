import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {AppLoaderService} from '@services/app-loader/app-loader.service';
import {TranslateService} from '@ngx-translate/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {DateAdapter, MAT_DATE_FORMATS} from '@angular/material/core';
import {APP_DATE_FORMATS, AppDateAdapter} from '@helpers/format-datepicker';
import {egretAnimations} from '@animations/egret-animations';
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {AppConfirmService} from "@services/app-confirm/app-confirm.service";
import {debounceTime, finalize, switchMap, tap} from "rxjs/operators";
import {AppErrorService} from "@services/app-error/app-error.service";
import * as moment from "moment";
import {Subscription} from "rxjs";
import {PayService} from "@services/entities/pay.service";
import {IDiscount} from "@models/discount.model";
import {DiscountService} from "@services/entities/discount.service";
import {ICustomer} from "@models/customer.model";
import {CustomerPopupComponent} from "@components/customer-popup/customer-popup.component";
import {CustomerService} from "@services/entities/customer.service";
import {IProduct, Product} from "@models/product.model";
import {ProductService} from "@services/entities/product.service";
import {IProductState} from "@models/product-state.model";
import {ICategory} from "@models/category.model";
import {IStore, Store} from "@models/store.model";
import {ProviderService} from "@services/entities/provider.service";
import {ProductStateService} from "@services/entities/productState.service";
import {HttpResponse} from "@angular/common/http";
import {CategoryService} from "@services/entities/category.service";
import {JwtAuthService} from "@services/auth/jwt-auth.service";
import {ISale, Sale} from "@models/sale.model";
import {SaleService} from "@services/entities/sale.service";

@Component({
    selector: 'app-sale-product-list',
    templateUrl: './sale-product-list.component.html',
    styleUrls: ['./sale-product-list.component.scss'],
    providers: [
        {provide: DateAdapter, useClass: AppDateAdapter},
        {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
    ],
    animations: egretAnimations
})
export class SaleProductListComponent implements OnInit, OnDestroy {

    public getItemSub: Subscription[] = [];

    loading = false;

    _products: IProduct[] = [];
    productStates: IProductState[] = [];
    store: IStore = new Store();
    _sale: ISale;

    @Output() productChange = new EventEmitter();


    @Input()
    get sale(): ISale {
        return this._sale;
    }

    set sale(value: ISale) {
        if (value !== undefined) {
            this._sale = value;
            this.getProductsFromServer();
        }
    }

    constructor(private errorService: AppErrorService,
                private productService: ProductService,
                private t: TranslateService, private snack: MatSnackBar,
                private productStateService: ProductStateService,
                public jwtAuth: JwtAuthService,
               ) {

    }
    ngOnInit() {
        this.getData();
    }


    private getData() {
        this.getStates();
    }

    getProductsFromServer() {
        this.loading = true;

        const options = {
            'sale_id': this.sale.id,
        };

        this.getItemSub.push(
            this.productService.findForSale(this.sale.id).subscribe(resp => {
                    this._products = resp.body;
                    this.loading = false;
                },
                error => {
                    this.loading = false;
                    this.errorService.error(error)
                })
        )
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


    ngOnDestroy() {
        this.getItemSub.forEach(sub => sub.unsubscribe());
        this.getItemSub = [];
    }

    changeState(event, product: IProduct) {
        const newStateId = event.value;
        product.state_id = newStateId;

    }

}
