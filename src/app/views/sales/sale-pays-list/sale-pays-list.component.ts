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
                                    this.loading = false;
                                    this.snack.open(this.t.instant('error'), 'Ups!', {duration: 4000})
                                })))
                    }
                }));
    }


}
