import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subscription} from "rxjs";
import {Store, IStore} from "@models/store.model";
import {Sale, ISale} from "@models/sale.model";
import {IProduct} from "@models/product.model";
import {JwtAuthService} from "@services/auth/jwt-auth.service";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {AppConfirmService} from "@services/app-confirm/app-confirm.service";
import {AppLoaderService} from "@services/app-loader/app-loader.service";
import {ProductService} from "@services/entities/product.service";
import {SaleService} from "@services/entities/sale.service";
import {TranslateService} from "@ngx-translate/core";
import {AppErrorService} from "@services/app-error/app-error.service";
import {egretAnimations} from "@animations/egret-animations";
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from "@angular/material/core";
import {MAT_MOMENT_DATE_FORMATS, MomentDateAdapter} from "@angular/material-moment-adapter";
import {FormControl, FormGroup} from "@angular/forms";
import * as moment from "moment";
import {PayPopupComponent} from "@components/pays/pay-popup/pay-popup.component";
import {saleLike} from "@helpers/sales-helper";
import {FilterState, IFilterState} from "@models/filterState.model";
import {DatatableComponent} from "@swimlane/ngx-datatable";
import {isMoment, Moment} from "moment";
import {Pageable} from "@models/pageable.model";

@Component({
    selector: 'app-sales-list',
    templateUrl: './sales-list.component.html',
    styleUrls: ['./sales-list.component.scss'],
    animations: egretAnimations,
    providers: [
        {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
        {provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS},
    ],
})
export class SalesListComponent implements OnInit, OnDestroy {


    public getItemSub: Subscription[] = [];
    store: IStore = new Store();

    @ViewChild(DatatableComponent) table: DatatableComponent;


    public sales: ISale[] = [];
    public rows: ISale[] = [];
    public products: IProduct[] = [];


    dateFrom = moment().add(-20, 'days');
    dateTo = moment().add(+20, 'days');

    dateRange = new FormGroup({
        from: new FormControl(this.dateFrom),
        to: new FormControl(this.dateTo),
    });

    options: any = {
        filter_state: null
    };
    filters_state: IFilterState[] = [];
    resume: any[];
    loadingSales = false;

    public selectedSale: ISale;
    viewRightSidebar = false;


    constructor(public jwtAuth: JwtAuthService,
                private dialog: MatDialog, private snack: MatSnackBar,
                private confirmService: AppConfirmService, private errorService: AppErrorService,
                private loader: AppLoaderService, private productService: ProductService,
                private saleService: SaleService, private t: TranslateService) {
    }

    ngOnInit(): void {

        this.getItemSub.push(this.jwtAuth.store$.subscribe(value => {
                if (value) {
                    this.store = value
                }
            })
        );
        this.options.store_id = this.jwtAuth.getStore().id;

        this.getSalesFromServer();
        // this.getSalesResumeFromServer();
    }


    getSalesResumeFromServer() {
        this.loadingSales = true;
        const dateFrom = moment(this.dateRange.value.from);
        const dateTo = moment(this.dateRange.value.to);

        this.options = {
            ...this.options,
            'date_from': dateFrom.format('YYYY-MM-DD'),
            'date_to': dateTo.format('YYYY-MM-DD')
        };
        this.getItemSub.push(
            this.saleService.queryResume(this.options).subscribe(resp => {
                    // console.log(resp.body);
                    this.filters_state = resp.body;
                },
                error => {
                    this.loadingSales = false;
                    this.errorService.error(error)
                })
        )
    }

    getSalesFromServer() {
        this.loadingSales = true;
        const dateFrom = moment(this.dateRange.value.from);
        const dateTo = moment(this.dateRange.value.to);

        this.options = {
            ...this.options,
            'products': this.products.map(a => a.id).toString(),
            'date_from': dateFrom.format('YYYY-MM-DD'),
            'date_to': dateTo.format('YYYY-MM-DD')
        };
        this.getItemSub.push(
            this.saleService.query(this.options).subscribe(resp => {
                    this.rows = this.sales = resp.body;
                    this.table.offset = 0;
                    this.table.ngDoCheck();
                    this.loadingSales = false;
                    this.loader.close();
                },
                error => {
                    this.loadingSales = false;
                    this.errorService.error(error)
                })
        )
    }

    deleteSale(b: ISale) {
        this.loadingSales = true;
        this.confirmService.confirm({title: this.t.instant('confirm.delete'), message: this.t.instant('delete.confirmation.message')})
            .subscribe(res => {
                if (res) {
                    this.saleService.delete(b.id).subscribe(value1 => {
                            this.loadingSales = false;
                            this.getSalesFromServer();
                        },
                        error => {
                            this.loadingSales = false;
                            this.errorService.error(error);
                            this.snack.open('Ocurrio un error, intente mas tarde', 'OK', {duration: 4000});
                        });
                } else {
                    this.loadingSales = false;
                }
            })
    }


    cancelLateralForm() {
        this.viewRightSidebar = false;
    }

    savedBooking() {
        this.viewRightSidebar = false;
        this.selectedSale = new Sale();
        this.getSalesFromServer();
    }

    selectBooking(booking: ISale) {
        this.selectedSale = booking;
        this.viewRightSidebar = true;
    }

    addPayPopup(booking: ISale) {

        const dialogRef: MatDialogRef<any> = this.dialog.open(PayPopupComponent, {
            width: '920px',
            disableClose: true,
            data: {booking: booking}
        })
        dialogRef.afterClosed()
            .subscribe(res => {
                if (!res) {
                    return;
                }
                this.snack.open(this.t.instant('saved.success'), 'OK', {duration: 4000})

            })
    }

    filter(event) {
        const val = event.target.value.toLowerCase();

        // filter our data
        const temp = this.sales.filter(function (b) {
            return saleLike(val, b);
        });
        // update the rows
        // console.log(this.rows);
        this.rows = temp;
    }

    filterState(filter: any) {
        this.filters_state.filter(f => f.id !== filter.id).forEach( f => f.selected = false );
        filter.selected = !filter.selected;
        this.options. filter_state = filter.selected ? filter.id : null;
        this.getSalesFromServer();
    }

    compareDates(a: Moment, b: Moment): number {
        if (isMoment(a) && isMoment(b)) {
            return a.isBefore(b) ? -1 : 1;
        }
        return 0;

    }

    ngOnDestroy() {
        this.getItemSub.forEach(sub => sub.unsubscribe());
        this.getItemSub = [];
    }

}
