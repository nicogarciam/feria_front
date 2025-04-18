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
    selector: 'app-sale-lateral-form',
    templateUrl: './sale-lateral-form.component.html',
    styleUrls: ['./sale-lateral-form.component.scss'],
    providers: [
        {provide: DateAdapter, useClass: AppDateAdapter},
        {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
    ],
    animations: egretAnimations
})
export class SaleLateralFormComponent implements OnInit, OnDestroy {

    public getItemSub: Subscription[] = [];
    customer_search = new FormControl(false);

    new_state = new FormControl(false);

    filteredCustomers: ICustomer[] = [];
    loading = false;
    loadingPays = false;
    loadingPrice = false;
    loadingDiscounts = false;
    loadingCustomer = false;

    _product: IProduct;
    productStates: IProductState[] = [];
    store: IStore = new Store();
    sale: ISale;


    public itemForm: FormGroup;

    categories: ICategory[] = [];
    public photoGallery: any[] = [{url: '', state: '0'}];

    discounts: IDiscount[];


    @Output() productChange = new EventEmitter();
    @Output() cancel = new EventEmitter();
    @Output() saved = new EventEmitter();


    @Input()
    get product(): IProduct {
        return this._product;
    }

    set product(value: IProduct) {
        if (value !== undefined) {
            this._product = value;
            this.new_state = new FormControl(this._product.state_id);
            this.buildForm(this._product);
        }
    }

    constructor(private fb: FormBuilder, private confirmService: AppConfirmService, private errorService: AppErrorService,
                private loader: AppLoaderService, private productService: ProductService,
                private t: TranslateService, private snack: MatSnackBar, private productStateService: ProductStateService,
                private dialog: MatDialog, private payService: PayService, public jwtAuth: JwtAuthService,
                private discountService: DiscountService, private providerService: ProviderService,
                private customerService: CustomerService, private categoryService: CategoryService,
                private saleService: SaleService) {

    }
    ngOnInit() {
        this.store = this.jwtAuth.getStore();
        this.sale = this._product.sale ?? new Sale({
            store_id: this.store.id,
        });

        this.getItemSub.push(this.customer_search.valueChanges
            .pipe(
                debounceTime(10),
                tap(() => this.loadingCustomer = true),
                switchMap(value => this.customerService.query({q: value})
                    .pipe(
                        finalize(() => this.loadingCustomer = false),
                    )
                )
            ).subscribe(
                (result) => {
                    this.loadingCustomer = false;
                    this.filteredCustomers = result.body
                } ,
                (error) => {
                    console.log('Error ', error);
                    this.loadingCustomer = false;
                },
            ));

        this.getData();

    }


    private getData() {
        console.log("getData");
        this.getStates();
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


    buildForm(item: IProduct) {

        this.itemForm = this.fb.group({
            id: [item.id],
            code: [item.code, [Validators.required]],
            name: [item.name, [Validators.required]],
            description: [item.description],
            category_id: [item.category_id, [Validators.required]],
            provider_id: [item.provider_id, [Validators.required]],
            state_id: [item.state_id, [Validators.required]],

            color: [item.color],
            size: [item.size],
            price: [item.price, [Validators.required]],
            cost: [item.cost, [Validators.required]],
            note: [item.note],

            date_sale: [moment(), [Validators.required]],

        })
    }

    private createFromForm(): ISale {


        //
        // store?: IStore;
        // store_id?: number;
        // customer_id?: number,
        // customer?: ICustomer,
        // sale_state_id?: number,
        // sale_state?: ISaleState,
        // date_sale?: Moment;
        // date_pay?: Moment;
        // note?: string;
        // total_price?: number,
        // total_paid?: number,
        // coupon_code?: string;
        // days_to_confirm?: number;
        // days_to_cancel?: number;
        // created_at?: Moment;
        // products?: IProduct[];
        // discount?: number,
        //     pays?: IPay[],
        return {
            ...new Sale(),
            store_id: this.store.id,
            customer_id: this.sale.customer_id,


            date_sale: this.itemForm.get(['date_sale'])!.value,

        };
    }


    displayCustomerFn = (item?: ICustomer) => {
        if (item && item === 'new') {
            this.addCustomer({}, true);
        } else if (item) {
            this.sale.customer = item;
        }
    }



    public productStateCompare = function (option, value): boolean {
        return option.id === value.state_id;
    }


    cancelSelection(): void {
        this._product = new Product();
        this.cancel.emit();
    }


    saveSale(): void {
        this.loader.open();
        this.loading = true;

        this.sale = this.createFromForm();
        // VALIDATION

        if (this.sale.id) {
            this.getItemSub.push(this.saleService.update(this.sale).subscribe(b => {
                    this.loading = false;
                    this.loader.close();
                    this.saved.emit();
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
                    this.saved.emit();
                },
                error => {
                    this.loader.close();
                    this.errorService.error(error);
                    this.loading = false;
                }))
        }
    }

    public componentMethod(event) {
        event.target.select();
    }


    ngOnDestroy() {
        this.getItemSub.forEach(sub => sub.unsubscribe());
        this.getItemSub = [];
    }

    private addProvider(data: {}, isNew: boolean) {

        const title = (isNew ? this.t.instant('new') : this.t.instant('update'))
            + '  ' + this.t.instant('provider');
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
                    this._product.provider_id = res;
                }
            })

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
                    this._product.provider_id = res;
                }
            })
    }

    initGallery(product: Product) {
        // if(!product.gallery) {
        //     return;
        // }
        // this.photoGallery = product.gallery.map(i => {
        //     return {
        //         url: i,
        //         state: '0'
        //     }
        // });
        // if (this.photoGallery[0])  {
        //     this.photoGallery[0].state = '1';
        // }
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
