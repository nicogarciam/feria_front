import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {egretAnimations} from 'app/shared/animations/egret-animations';
import {ThemeService} from 'app/shared/services/theme.service';
import tinyColor from 'tinycolor2';
import {ColumnMode, DatatableComponent, SortType} from '@swimlane/ngx-datatable';
import {HttpResponse} from '@angular/common/http';
import {MatSnackBar} from '@angular/material/snack-bar';
import {AppLoaderService} from '@services/app-loader/app-loader.service';
import {TranslateService} from '@ngx-translate/core';
import {FormControl, FormGroup} from '@angular/forms';
import {Subscription} from 'rxjs';
import {debounceTime} from 'rxjs/operators';
import {StoreService} from '@services/entities/store.service';
import {Router} from '@angular/router';
import {JwtAuthService} from '@services/auth/jwt-auth.service';
import {IStore} from "@models/store.model";
import * as moment from "moment/moment";
import {ProductService} from "@services/entities/product.service";
import {AppErrorService} from "@services/app-error/app-error.service";
import {ISale} from "@models/sale.model";
import {IProduct} from "@models/product.model";

@Component({
    selector: 'app-default-dashboard',
    templateUrl: './default-dashboard.component.html',
    styleUrls: ['./default-dashboard.component.scss'],
    animations: egretAnimations
})
export class DefaultDashboardComponent implements OnInit, OnDestroy {


    public getItemSub: Subscription[] = [];
    newSales = 0;
    newProducts = 0;
    totalProducts = 0;
    totalSales = 0;

    public rows: IProduct[] = [];
    public products: IProduct[] = [];

    SortType = SortType;
    ColumnMode = ColumnMode;
    stores: IStore[];
    registered = true;

    @ViewChild(DatatableComponent) productsTable: DatatableComponent;

    loadingProducts = false;

    isOpen = false;
    searchCtrl = new FormControl();
    searchCtrlSub: Subscription;


    dateFrom = moment().add(-20, 'days');
    dateTo = moment().add(+20, 'days');

    dateRange = new FormGroup({
        from: new FormControl(this.dateFrom),
        to: new FormControl(this.dateTo),
    });

    options: any = {
        filter_state: null
    };


    public lineChartColors: Array<any> = [];


    constructor(
        private themeService: ThemeService, private snack: MatSnackBar, private loader: AppLoaderService,
        private translate: TranslateService, public storeService: StoreService,
        private router: Router, public jwtAuth: JwtAuthService, public productService: ProductService,
        private errorService: AppErrorService
    ) {
        this.options.store_id = this.jwtAuth.getStore().id;

    }

    ngOnInit() {
        this.getData();

    }

    getData() {
        this.getMyStores();
        this.getProducts();
    }


    getProducts() {
        this.loadingProducts = true;
        const dateFrom = moment(this.dateRange.value.from);
        const dateTo = moment(this.dateRange.value.to);

        this.options = {
            ...this.options,
            'date_from': dateFrom.format('YYYY-MM-DD'),
            'date_to': dateTo.format('YYYY-MM-DD')
        };
        this.getItemSub.push(
            this.productService.queryPage(this.options).subscribe(resp => {
                    this.rows = this.products = resp.body.data;
                    this.productsTable.offset = 0;
                    this.productsTable.ngDoCheck();
                    this.loadingProducts = false;
                    this.loader.close();
                },
                error => {
                    this.loadingProducts = false;
                    this.errorService.error(error)
                })
        )
    }


    getMyStores() {
        this.storeService.myStores()
            .subscribe((res: HttpResponse<IStore[]>) => {
                    (this.stores = res.body || null)
                },
                (error) => {
                    this.registered = false;
                }
            );
    }

    toggle() {
        this.isOpen = !this.isOpen;
    }

    ngOnDestroy() {
        if (this.searchCtrlSub) {
            this.searchCtrlSub.unsubscribe();
        }
        this.getItemSub.forEach(sub => sub.unsubscribe());
        this.getItemSub = [];

    }

    public componentMethod(event) {
        event.target.select();
    }

}
