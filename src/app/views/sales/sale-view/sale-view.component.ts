import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Subscription} from "rxjs";
import {FormBuilder, FormControl} from "@angular/forms";
import {Sale, ISale} from "@models/sale.model";
import {ISaleState} from "@models/saleState.model";
import {IProduct} from "@models/product.model";
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
    selector: 'app-sales-view',
    templateUrl: './sale-view.component.html',
    styleUrls: ['./sale-view.component.scss'],
    providers: [
        {provide: DateAdapter, useClass: AppDateAdapter},
        {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
    ],
    animations: egretAnimations
})
export class SaleViewComponent implements OnInit, OnDestroy {

    public getItemSub: Subscription[] = [];
    customer_search = new FormControl(false);

    filteredCustomers: ICustomer[] = [];
    garageSelected = new FormControl();
    new_state = new FormControl(false);
    loading = false;
    _sale: ISale = new Sale({guests: []});
    saleStates: ISaleState[] = [];
    _saleStates: ISaleState[] = [];
    products: IProduct[];

    loadingSale = true;
    loadingPays = true;
    loadingStates = false;
    loadingProducts = false;
    loadingCustomer: boolean;


    @Output() saleChange = new EventEmitter();
    @Output() cancel = new EventEmitter();
    @Output() saved = new EventEmitter();


    @Input()
    saleID;


    @Input()
    get sale(): ISale {
        return this._sale;
    }

    set sale(value: ISale) {
        if (value !== undefined) {
            this._sale = value;
            this.new_state = new FormControl(this._sale.sale_state.id);
            this.updateBookingData();
            this.saleChange.emit(this._sale);
        }
    }
    
    constructor(private fb: FormBuilder, private confirmService: AppConfirmService, private errorService: AppErrorService,
                private loader: AppLoaderService, private productService: ProductService,
                private saleService: SaleService, private router: ActivatedRoute,
                private t: TranslateService, private snack: MatSnackBar, private storeService: StoreService,
                private dialog: MatDialog, private payService: PayService,  public layout: LayoutService,
                private customerService: CustomerService) {
    }

    ngOnInit() {

        this.loader.open();
        this.layout.setProperty({useBreadcrumb: true})
        this.saleID = this.router.snapshot.params.bookingID;
        this.getItemSub.push(
            this.saleService.find(this.saleID)
            .subscribe((res) => {
                    (this.sale = res.body);
                    this.loader.close();
                },
                (error) => {
                    console.log(error);
                    this.loader.close();
                    this.errorService.error(error);
                }
            ));

        this.customer_search.valueChanges
            .pipe(
                debounceTime(100),
                tap(() => this.loading = true),
                switchMap(value => this.customerService.query({q: value})
                    .pipe(
                        finalize(() => this.loading = false),
                    )
                )
            ).subscribe(
            (result) =>
                this.filteredCustomers = result.body,
            (error) => {
                console.log('Error ', error);
                this.errorService.error(error);
            },
        );

    }

    updateBookingData() {
        this.getSalePays();
        this.getBSaleStates();
        this.getStoreSaleStates();
        this.getSaleProducts();
    }
    

    getStoreSaleStates() {
        this.getItemSub.push(
            this.storeService.findSaleStates(this._sale.store_id).subscribe(res => {
                    this.saleStates = res.body
                },
                error => this.errorService.error(error)));
    }

    calculateBookingTotalPrice() {
        this.calculateTotalPrice(this._sale);
    }

    private calculateTotalPrice(_sale: ISale) {
        return _sale.total_price;
    }

    public bookingStateCompare = function (option, value): boolean {
        return option.id === value.state_id;
    }


    cancelSelection(): void {
        this._sale = new Sale();
        this.cancel.emit();
    }

    saveSale(): void {
        this.loader.open();
        this.loading = true;
        this._sale.sale_state = this.new_state.value;
        if (this._sale.id) {
            this.getItemSub.push(
                this.saleService.update(this._sale).subscribe(b => {
                    this.loading = false;
                    this.sale = b.body;
                    this.loader.close();
                    this.snack.open(this.t.instant('saved.success'), 'OK', {duration: 4000})
                    // this.saved.emit();
                },
                error => {
                    console.log(error);
                    this.loader.close();
                    this.errorService.error(error);
                    this.loading = false;
                }));
        } else {
            this.getItemSub.push(
                this.saleService.create(this._sale).subscribe(b => {
                    this.loading = false;
                    this.loader.close();
                    this.snack.open(this.t.instant('saved.success'), 'OK', {duration: 4000});
                },
                error => {
                    console.log(error);
                    this.loader.close();
                    this.errorService.error(error);
                    this.loading = false;
                }));
        }
    }

    deleteSale() {
        this.loading = true;
        this.loader.open();
        this.getItemSub.push(
            this.confirmService.confirm({title: this.t.instant('confirm.delete'), message: this.t.instant('delete.confirmation.message')})
            .subscribe(res => {
                if (res) {
                    this.saleService.delete(this._sale.id).subscribe(value1 => {
                            this.loading = false;
                            this.loader.close();
                            this.saved.emit();
                        },
                        error => {
                            this.loading = false;
                            this.loader.close();
                            this.errorService.error(error);
                        });
                }

            }));
    }

    public componentMethod(event) {
        event.target.select();
    }


    ngOnDestroy() {
        this.getItemSub.forEach(sub => sub.unsubscribe());
        this.getItemSub = [];
        this.layout.setProperty({useBreadcrumb: false})
    }

    // BOOKING ACCOMMODATIONS
    private getSaleProducts() {
        this.loadingProducts = true;
        this.getItemSub.push(
            this.productService.findForSale(this._sale.id)
            .subscribe(res => {
                    (this._sale.products = res.body || []);
                    this.loadingProducts = false;
                },
                (error) => {
                    console.log(error);
                    this.errorService.error(error);
                    this.loadingProducts = false;
                }
            ));
    }

    // BOOKING STATES
    getBSaleStates() {
        this.loadingStates = true;
        this.getItemSub.push(
            this.saleService.queryStates(this._sale.id, null)
            .subscribe(res => {
                    (this._saleStates = res.body || []);
                    this.loadingStates = false;
                },
                (error) => {
                    console.log(error);
                    this.errorService.error(error);
                    this.loadingStates = false;
                }
            ));
    }


    // PAYS
    getSalePays() {
        this.loadingPays = true;
        this.getItemSub.push(
            this.payService.query({'booking_id': this._sale.id})
            .subscribe(res => {
                    (this._sale.pays = res.body || []);
                    this.loadingPays = false;
                },
                (error) => {
                    console.log(error);
                    this.errorService.error(error);
                    this.loadingPays = false;
                }
            ));
    }

    addPayPopup() {
        const dialogRef: MatDialogRef<any> = this.dialog.open(PayPopupComponent, {
            width: '820px',
            disableClose: true,
            data: {booking: this._sale}
        })
        dialogRef.afterClosed()
            .subscribe(res => {
                if (!res) {
                    return;
                }
                this.getSalePays();
                this.snack.open(this.t.instant('saved.success'), 'OK', {duration: 4000})
            })
    }

    deletePay(pay: IPay) {
        const message = this.t.instant('delete') + ' ' + this.t.instant('pays') + ' ?'
        this.getItemSub.push(
            this.confirmService.confirm({title: this.t.instant('are.you.sure'), message: message})
            .subscribe(res => {
                if (res) {
                    this.getItemSub.push(this.payService.delete(pay.id)
                        .subscribe(item => {
                                this.getSalePays();
                                this.snack.open(this.t.instant('deleted'), 'OK', {duration: 4000})
                            },
                            (error => {
                                this.loadingPays = false;
                                this.snack.open(this.t.instant('error'), 'Ups!', {duration: 4000})
                            })))
                }
            }));
    }
    

}
