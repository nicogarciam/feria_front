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
import {HttpResponse} from "@angular/common/http";
import {IProductState} from "@models/product-state.model";
import {ProductStateService} from "@services/entities/productState.service";
import { saleStateFactory } from '@shared/models/saleState.model'; // Added import

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
    loading = true;
    _sale: ISale = new Sale({guests: []});
    saleStates: ISaleState[] = [];
    _saleStates: ISaleState[] = [];
    products: IProduct[];
    productStates: IProductState[] = [];

    loadingPays = true;
    loadingStates = false;
    loadingProducts = false;
    loadingCustomer: boolean;


    @Output() saleChange = new EventEmitter();
    @Output() cancel = new EventEmitter();
    @Output() saved = new EventEmitter();


    @Input() saleID;


    @Input()
    get sale(): ISale {
        return this._sale;
    }

    set sale(value: ISale) {
        if (value !== undefined) {
            console.log("set sale");
            this._sale = value;
            this.new_state = new FormControl(this._sale.sale_state);
            this.updateSaleData();
            this.saleChange.emit(this._sale);
        }
    }
    
    constructor(private fb: FormBuilder, private confirmService: AppConfirmService,
                private errorService: AppErrorService,
                private loader: AppLoaderService, private productService: ProductService,
                private saleService: SaleService, private router: ActivatedRoute,
                private t: TranslateService, private snack: MatSnackBar, private storeService: StoreService,
                private payService: PayService,  public layout: LayoutService,
                private customerService: CustomerService, private productStateService: ProductStateService) {
    }

    ngOnInit() {
        this.getStoreSaleStates();
        this.getProductStates();
        this.loader.open();
        this.layout.setProperty({useBreadcrumb: true})
        this.saleID = this.router.snapshot.params.saleID;
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

    updateSaleData() {
        this.getSaleStates();
    }
    

    getStoreSaleStates() {
        this.getItemSub.push(
            this.storeService.findSaleStates(this._sale.store_id)
                .subscribe(res => {
                    this.saleStates = res.body
                },
                error => this.errorService.error(error)));
    }

    private getProductStates() {
        this.getItemSub.push(this.productStateService.query()
            .subscribe((res: HttpResponse<IProductState[]>) => {
                    (this.productStates = res.body || [])
                },
                (error) => {
                    console.log(error);
                }
            ));
    }

    calculateSaleTotalPrice() {
        this.calculateTotalPrice(this._sale);
    }

    private calculateTotalPrice(_sale: ISale) {
        return _sale.total_price;
    }

    public saleStateCompare = function (option, value): boolean {
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
                    this.sale = b.body; // Re-assign to trigger setter
                    this.loader.close();
                    this.snack.open(this.t.instant('saved.success'), 'OK', {duration: 4000})
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
                } else { // If user cancels deletion
                    this.loading = false;
                    this.loader.close();
                }
            }));
    }

    public componentMethod(event) {
        event.target.select();
    }

    // New methods start here
    public onPaymentUpdated(): void {
        this.loader.open();
        this.getItemSub.push(
            this.saleService.find(this.sale.id).subscribe(
                updatedSaleRes => {
                    this.loader.close();
                    if (!updatedSaleRes.body) {
                        this.errorService.error({ message: 'Failed to load updated sale data.' });
                        return;
                    }
                    // CRITICAL: Assign to this.sale to trigger the setter and update related data
                    this.sale = updatedSaleRes.body;

                    const totalPaid = (this.sale.pays || []).reduce((sum, pay) => sum + (pay.amount || 0), 0);

                    if (this.sale.total_price != null && totalPaid >= this.sale.total_price) {
                        const currentSaleStateName = this.sale.sale_state?.name?.toLowerCase();
                        const isNotFinalState = currentSaleStateName !== 'paid' && currentSaleStateName !== 'pagado' &&
                                              currentSaleStateName !== 'canceled' && currentSaleStateName !== 'cancelado';
                        if (isNotFinalState) {
                            this.promptForStatusUpdate(totalPaid);
                        }
                    }
                },
                error => {
                    this.loader.close();
                    this.errorService.error(error);
                }
            )
        );
    }

    private promptForStatusUpdate(totalPaid: number): void {
        const message = this.t.instant('confirm.updateSaleStatus.message'); // This message will be updated later
        const title = this.t.instant('confirm.updateSaleStatus.title');

        this.getItemSub.push(
            this.confirmService.confirm({ title: title, message: message })
            .subscribe(confirmationResult => {
                if (confirmationResult) {
                    this.updateSaleStatusToPaid(); // Renamed method called here
                }
            })
        );
    }

    private updateSaleStatusToPaid(): void { // Renamed method
        this.loader.open();

        const paidState = saleStateFactory['PAID'];
        if (!paidState) {
            console.error("PAID state definition not found in saleStateFactory.");
            this.loader.close();
            this.snack.open("Error: PAID state configuration is missing.", "ERROR", { duration: 4000 }); // Or use a translated key
            return;
        }

        const saleToUpdate = { ...this.sale }; // Work with a copy
        saleToUpdate.sale_state = paidState;
        saleToUpdate.sale_state_id = paidState.id != null ? paidState.id : 3;

        this.getItemSub.push(
            this.saleService.update(saleToUpdate).subscribe(
                updatedSaleRes => {
                    this.loader.close();
                    if (updatedSaleRes.body) {
                        this.sale = updatedSaleRes.body; // Update the main sale object
                    }
                    // Use new translation key for "Sale updated to PAID"
                    this.snack.open(this.t.instant('sale.updatedToPaid.success'), 'OK', { duration: 4000 });
                },
                saleUpdateError => {
                    this.loader.close();
                    this.errorService.error(saleUpdateError);
                }
            )
        );
    }
    // End of new methods

    ngOnDestroy() {
        this.getItemSub.forEach(sub => sub.unsubscribe());
        this.getItemSub = [];
        this.layout.setProperty({useBreadcrumb: false})
    }

    // SALE PRODUCTS
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

    changeItemProductState(event, item: IProduct) {
        item.state_id = event.value;
    };

    removeProduct(cartItem: IProduct) {
        this._sale.products = this._sale.products.filter(item => item.id !== cartItem.id);
    }

    // SALE STATES
    getSaleStates() {
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

    compareFn(o1: any, o2: any) {
        console.log(o2);
        return o1 != null && o2 != null ? (o1.id === o2.id) : false;
    }
}
