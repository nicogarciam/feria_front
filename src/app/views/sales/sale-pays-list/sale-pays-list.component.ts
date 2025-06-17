import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {DateAdapter, MAT_DATE_FORMATS} from '@angular/material/core';
import {APP_DATE_FORMATS, AppDateAdapter} from '@helpers/format-datepicker';
import {egretAnimations} from '@animations/egret-animations';
import {AppErrorService} from "@services/app-error/app-error.service";
import {Subscription} from "rxjs";
import {PayService} from "@services/entities/pay.service";
import {IProduct} from "@models/product.model";
import {ProductService} from "@services/entities/product.service";
import {IProductState} from "@models/product-state.model";
import {IStore, Store} from "@models/store.model";
import {ProductStateService} from "@services/entities/productState.service";
import {HttpResponse} from "@angular/common/http";
import {JwtAuthService} from "@services/auth/jwt-auth.service";
import {ISale} from "@models/sale.model";
import {IPay} from "@models/pay.model";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {PayPopupComponent} from "@components/pays/pay-popup/pay-popup.component";
import {AppConfirmService} from "@services/app-confirm/app-confirm.service";
import {SaleService} from "@services/entities/sale.service"; // Added SaleService
import {saleStateFactory} from "@shared/models/saleState.model"; // Added saleStateFactory

@Component({
    selector: 'app-sale-pays-list',
    templateUrl: './sale-pays-list.component.html',
    styleUrls: ['./sale-pays-list.component.scss'],
    providers: [
        {provide: DateAdapter, useClass: AppDateAdapter},
        {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
    ],
    animations: egretAnimations
})
export class SalePaysListComponent implements OnInit, OnDestroy {

    public getItemSub: Subscription[] = [];

    loading = false;

    _pays: IPay[] = [];
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
            this.getPaysFromServer();
        }
    }

    constructor(private errorService: AppErrorService,
                private productService: ProductService, private payService: PayService,
                private saleService: SaleService, // Injected SaleService
                private t: TranslateService, private snack: MatSnackBar,
                private confirmService: AppConfirmService,
                public jwtAuth: JwtAuthService, private dialog: MatDialog,
    ) {

    }
    ngOnInit() {

    }

    getSalePays() {
        this.loading = true;
        this.getItemSub.push(
            this.payService.query({'sale_id': this._sale.id})
                .subscribe(res => {
                        (this._sale.pays = res.body || []);
                        this.loading = false;
                    },
                    (error) => {
                        console.log(error);
                        this.errorService.error(error);
                        this.loading = false;
                    }
                ));
    }


    getPaysFromServer() {
        this.loading = true;

        const options = {
            'sale_id': this.sale.id,
        };

        this.getItemSub.push(
            this.payService.findForSale(this.sale.id).subscribe(resp => {
                    this._pays = resp.body;
                    this.loading = false;
                },
                error => {
                    this.loading = false;
                    this.errorService.error(error)
                })
        )
    }


    ngOnDestroy() {
        this.getItemSub.forEach(sub => sub.unsubscribe());
        this.getItemSub = [];
    }

    changeState(event, product: IProduct) {
        const newStateId = event.value;
        product.state_id = newStateId;

    }

    addPayPopup() {
        const dialogRef: MatDialogRef<any> = this.dialog.open(PayPopupComponent, {
            width: '820px',
            disableClose: true,
            data: {sale: this._sale}
        })
        dialogRef.afterClosed()
            .subscribe(res => {
                if (!res) {
                    return;
                }
                // New logic starts here
                this.loading = true;
                this.getItemSub.push(
                    this.payService.findForSale(this.sale.id).subscribe(
                        paysRes => {
                            if (paysRes.body) {
                                this.sale.pays = paysRes.body;
                            }
                            // Fetch the full updated Sale object
                            this.getItemSub.push(
                                this.saleService.find(this.sale.id).subscribe(
                                    updatedSaleRes => {
                                        if (updatedSaleRes.body) {
                                            this.sale = updatedSaleRes.body; // Update the main sale object
                                            this._pays = this.sale.pays; // Also update _pays if it's used by the template directly for pays list
                                        }

                                        const totalPaid = (this.sale.pays || []).reduce((sum, pay) => sum + (pay.amount || 0), 0);

                                        if (this.sale.total_price !== undefined && totalPaid >= this.sale.total_price) {
                                            this.getItemSub.push(
                                                this.confirmService.confirm({
                                                    title: this.t.instant('confirm.updateSaleStatus.title'), // New translation key
                                                    message: this.t.instant('confirm.updateSaleStatus.message') // New translation key
                                                }).subscribe(confirmationResult => {
                                                    if (confirmationResult) {
                                                        const paidState = saleStateFactory['PAID'];
                                                        if (!paidState) {
                                                            console.error('PAID state not found in saleStateFactory');
                                                            this.snack.open('Error: PAID state definition missing.', 'ERROR', { duration: 4000 });
                                                            this.loading = false;
                                                            return;
                                                        }
                                                        this.sale.sale_state = paidState;
                                                        // Assuming paidState.id exists, otherwise use 3 as per instructions
                                                        this.sale.sale_state_id = paidState.id !== undefined ? paidState.id : 3;

                                                        this.getItemSub.push(
                                                            this.saleService.update(this.sale).subscribe(
                                                                () => { // Sale updated successfully
                                                                    // Update Product Statuses
                                                                    if (this.sale.products && this.sale.products.length > 0) {
                                                                        let productsUpdatedCount = 0;
                                                                        const totalProductsToUpdate = this.sale.products.length;
                                                                        this.sale.products.forEach(product => {
                                                                            const originalStateId = product.state_id; // Keep original for potential rollback or logging
                                                                            product.state_id = 2; // Placeholder ID for 'vendidos'
                                                                            this.getItemSub.push(
                                                                                this.productService.update(product).subscribe(
                                                                                    () => {
                                                                                        productsUpdatedCount++;
                                                                                        if (productsUpdatedCount === totalProductsToUpdate) {
                                                                                            this.snack.open(this.t.instant('saleAndProducts.updated.success'), 'OK', {duration: 4000}); // New translation key
                                                                                            this.productChange.emit(); // Emit event to refresh parent/product list if necessary
                                                                                            this.loading = false;
                                                                                        }
                                                                                    },
                                                                                    prodUpdateErr => {
                                                                                        console.error('Error updating product status:', prodUpdateErr);
                                                                                        product.state_id = originalStateId; // Revert on error
                                                                                        // Potentially collect errors and show a summary
                                                                                        productsUpdatedCount++; // Count as processed
                                                                                        if (productsUpdatedCount === totalProductsToUpdate) {
                                                                                             this.snack.open(this.t.instant('sale.updated.products.error'), 'ERROR', { duration: 4000 }); // New translation key for partial success
                                                                                             this.loading = false;
                                                                                        }
                                                                                    }
                                                                                )
                                                                            );
                                                                        });
                                                                    } else {
                                                                        this.snack.open(this.t.instant('sale.updated.success'), 'OK', {duration: 4000}); // New translation key (sale updated, no products or no change needed)
                                                                        this.loading = false;
                                                                    }
                                                                },
                                                                saleUpdateErr => {
                                                                    console.error('Error updating sale status:', saleUpdateErr);
                                                                    this.snack.open(this.t.instant('error.updating.sale'), 'ERROR', {duration: 4000});
                                                                    this.loading = false;
                                                                }
                                                            )
                                                        );
                                                    } else {
                                                        // User did not confirm status update
                                                        this.snack.open(this.t.instant('saved.success'), 'OK', {duration: 4000}); // Original message: pay saved
                                                        this.loading = false;
                                                    }
                                                })
                                            );
                                        } else {
                                            // Total paid is less than total price, or total_price is undefined
                                            this.snack.open(this.t.instant('saved.success'), 'OK', {duration: 4000});
                                            this.loading = false;
                                            if (this.sale.total_price === undefined) {
                                                console.warn('Sale total_price is undefined after fetching.');
                                            }
                                        }
                                    },
                                    updatedSaleErr => {
                                        console.error("Error fetching updated sale:", updatedSaleErr);
                                        this.snack.open(this.t.instant('error.fetching.sale'), 'ERROR', {duration: 4000});
                                        this.loading = false;
                                    }
                                )
                            );
                        },
                        paysErr => {
                            console.error("Error fetching pays for sale:", paysErr);
                            this.snack.open(this.t.instant('error.fetching.pays'), 'ERROR', {duration: 4000});
                            this.loading = false;
                        }
                    )
                );
                // New logic ends here
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
                                    this.loading = false;
                                    this.snack.open(this.t.instant('error'), 'Ups!', {duration: 4000})
                                })))
                    }
                }));
    }


}
