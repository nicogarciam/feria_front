import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Subscription} from "rxjs";
import {FormBuilder, FormControl} from "@angular/forms";
import {Sale, ISale} from "@models/sale.model";
import {ISaleState} from "@models/saleState.model";
import {IProduct, Product} from "@models/product.model";
import {AppConfirmService} from "@services/app-confirm/app-confirm.service";
import {AppErrorService} from "@services/app-error/app-error.service";
import {AppLoaderService} from "@services/app-loader/app-loader.service";
import {ProductService} from "@services/entities/product.service";
import {SaleService} from "@services/entities/sale.service";
import {TranslateService} from "@ngx-translate/core";
import {MatSnackBar} from "@angular/material/snack-bar";
import {StoreService} from "@services/entities/store.service";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {PayService} from "@services/entities/pay.service";
import {debounceTime, finalize, switchMap, tap} from "rxjs/operators";
import * as moment from "moment";
import {PayPopupComponent} from "@components/pays/pay-popup/pay-popup.component";
import {DateAdapter, MAT_DATE_FORMATS} from "@angular/material/core";
import {APP_DATE_FORMATS, AppDateAdapter} from "@helpers/format-datepicker";
import {egretAnimations} from "@animations/egret-animations";
import {ActivatedRoute} from "@angular/router";
import {IPay} from "@models/pay.model";
import {LayoutService} from "@services/layout.service";
import {CustomerService} from "@services/entities/customer.service";
import {ICustomer} from "@models/customer.model";

@Component({
    selector: 'app-product-view',
    templateUrl: './product-view.component.html',
    styleUrls: ['./product-view.component.scss'],
    providers: [
        {provide: DateAdapter, useClass: AppDateAdapter},
        {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
    ],
    animations: egretAnimations
})
export class ProductViewComponent implements OnInit, OnDestroy {

    public getItemSub: Subscription[] = [];
    customer_search = new FormControl(false);

    filteredCustomers: ICustomer[] = [];

    new_state = new FormControl(false);
    loading = false;
    _product: IProduct = new Product({});
    products: IProduct[];

    saleStates: ISaleState[];

    loadingSale = true;
    loadingPays = true;

    loadingStates = false;

    @Output() saleChange = new EventEmitter();
    @Output() cancel = new EventEmitter();
    @Output() saved = new EventEmitter();


    @Input()
    saleID;


    @Input()
    get product(): IProduct {
        return this._product;
    }

    set product(value: IProduct) {
        if (value !== undefined) {
            this._product = value;
            this.new_state = new FormControl(this._product.state_id);
            this.saleChange.emit(this._product);
        }
    }
    
    constructor(private fb: FormBuilder, private confirmService: AppConfirmService, private errorService: AppErrorService,
                private loader: AppLoaderService, private productService: ProductService,
                private router: ActivatedRoute,
                private t: TranslateService, private snack: MatSnackBar, private storeService: StoreService,
                private dialog: MatDialog, private payService: PayService,  public layout: LayoutService,
                private customerService: CustomerService) {
    }

    ngOnInit() {

        this.loader.open();
        this.layout.setProperty({useBreadcrumb: true})
        this.saleID = this.router.snapshot.params.bookingID;
        this.getItemSub.push(
            this.productService.find(this.saleID)
            .subscribe((res) => {
                    (this.product = res.body);
                    this.loader.close();
                },
                (error) => {
                    console.log(error);
                    this.loader.close();
                    this.errorService.error(error);
                }
            ));

    }


    public componentMethod(event) {
        event.target.select();
    }


    ngOnDestroy() {
        this.getItemSub.forEach(sub => sub.unsubscribe());
        this.getItemSub = [];
        this.layout.setProperty({useBreadcrumb: false})
    }


    

}
