import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Observable, Subscription} from "rxjs";
import {IStore, Store} from "@models/store.model";
import {ISale} from "@models/sale.model";
import {IProduct} from "@models/product.model";
import {JwtAuthService} from "@services/auth/jwt-auth.service";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {AppConfirmService} from "@services/app-confirm/app-confirm.service";
import {ProductService} from "@services/entities/product.service";
import {TranslateService} from "@ngx-translate/core";
import {AppErrorService} from "@services/app-error/app-error.service";
import {egretAnimations} from "@animations/egret-animations";
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from "@angular/material/core";
import {MAT_MOMENT_DATE_FORMATS, MomentDateAdapter} from "@angular/material-moment-adapter";
import {FormControl, FormGroup} from "@angular/forms";
import * as moment from "moment";
import {Moment} from "moment";
import {IFilterState} from "@models/filterState.model";
import {ColumnMode, DatatableComponent, SortType} from "@swimlane/ngx-datatable";
import {productLike} from "@helpers/products-helper";
import {Pageable} from "@models/pageable.model";
import {CartService} from "@services/cart/cart.service";
import {IProductState} from "@models/product-state.model";
import {ProductStateService} from "@services/entities/productState.service";
import {HttpResponse} from "@angular/common/http";
import {CartQuery} from "@services/cart/cart.query";
import {CartItem} from "@models/cartItem";
import {CartAnimationService} from "@services/cart/cart-animation.service";

@Component({
    selector: 'app-product-table',
    templateUrl: './product-table.component.html',
    styleUrls: ['./product-table.component.scss'],
    animations: egretAnimations,
    providers: [
        {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
        {provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS},
    ],
})
export class ProductTableComponent implements OnInit, OnDestroy {


    pageable = new Pageable();
    public getItemSub: Subscription[] = [];
    store: IStore = new Store();

    public rows: IProduct[] = [];
    public products: IProduct[] = [];

    public pageSizeOptions = [
        {value: 5},
        {value: 10},
        {value: 20},
        {value: 50},
        {value: 100},
    ];


    dateFrom = moment().add(-20, 'days');
    dateTo = moment().add(+20, 'days');

    dateRange = new FormGroup({
        from: new FormControl(this.dateFrom),
        to: new FormControl(this.dateTo),
    });

    options: any = {
        states_selected: [1, 2]
    };
    states_selected_form = new FormControl([1, 2]);
    filters_state: IFilterState[] = [];

    productStates: IProductState[] = [];

    loadingProducts = false;

    public selectedProduct: IProduct;

    viewABMRightSidebar = false;
    viewSaleRightSidebar = false;

    ColumnMode = ColumnMode;
    SortType = SortType;
    cart$: Observable<CartItem[]>;
    public cartProducts: IProduct[] = [];

    _layout = { layout: 'full', actions: true};

    @ViewChild(DatatableComponent) table: DatatableComponent;

    @Input() perPage = 20;

    @Input()
    get layout(): any {
        return this._layout;
    }

    set layout(value: any) {
        if (value !== undefined) {
            this._layout = value === 'compact' ? { layout: 'compact', actions: false} :
                { layout: 'full', actions: true};
        }
    }


    constructor(public jwtAuth: JwtAuthService,
                private dialog: MatDialog, private snack: MatSnackBar, protected cartQuery: CartQuery,
                private confirmService: AppConfirmService, private errorService: AppErrorService,
                private productService: ProductService, private t: TranslateService,
                private cartService: CartService, private productStateService: ProductStateService,
                private cartAnimationService: CartAnimationService) {
        this.pageable.page = 0;
    }

    ngOnInit(): void {
        this.pageable.per_page = this.perPage;
        this.getItemSub.push(this.jwtAuth.store$.subscribe(value => {
                if (value) {
                    this.store = value
                }
            })
        );
        this.options.store_id = this.jwtAuth.getStore().id;
        this.getStates();

        this.setPage({offset: 0, pageSize: this.pageable.per_page});
        this.cart$ = this.cartQuery.selectAll();
        this.cart$.subscribe(carItems => {
           this.cartProducts = carItems.map(c => c.product);
        });
    }

    private isInCart(product: IProduct): boolean {
        return this.cartProducts.find(c => c.id === product.id) !== undefined;
    }

    private getStates() {
        this.getItemSub.push(this.productStateService.query()
            .subscribe((res: HttpResponse<IProductState[]>) => {
                    (this.productStates = res.body || []);
                },
                (error) => {
                    console.log(error);
                }
            ));
    }

    getRowClass = (row) => {
        return {
            'disponible': row.state.name === 'disponible',
            'prueba': row.state.name === 'prueba',
            'vendido': row.state.name === 'vendido',
            'incart': this.isInCart(row)
        };
    }

    public pegaSizeChange(pageSize: any): void {
        this.pageable.per_page = pageSize.target?.value;
        this.pageable.page = 1;
        this.getProductsFromServer();
    }

    setPage(pageInfo) {
        this.pageable = pageInfo;
        this.pageable.page = pageInfo.offset + 1;
        this.pageable.per_page = pageInfo.pageSize;

        this.getProductsFromServer();
    }

    onSort(event: any) {
        this.options.sorts.push(event.sorts[0]);
        this.getProductsFromServer()
    }

    getProductsFromServer() {
        this.loadingProducts = true;
        const dateFrom = moment(this.dateRange.value.from);
        const dateTo = moment(this.dateRange.value.to);
        this.options = {
            ...this.options,
            'date_from': dateFrom.format('YYYY-MM-DD'),
            'date_to': dateTo.format('YYYY-MM-DD')
        };

        const query = {
            ...this.pageable,
            ...this.options,
        }
        this.getItemSub.push(
            this.productService.queryPage(query).subscribe(resp => {
                    this.rows = this.products = resp.body.data;
                    this.setPageable(resp.body);
                    this.loadingProducts = false;
                },
                error => {
                    this.loadingProducts = false;
                    this.errorService.error(error)
                })
        )
    }

    setPageable(resp: any) {
        this.pageable.page = resp.current_page;
        this.pageable.current_page = resp.current_page;
        this.pageable.per_page = resp.per_page;
        this.pageable.from = resp.from;
        this.pageable.to = resp.to;
        this.pageable.total = resp.total;
        this.pageable.last_page = resp.last;
    }

    deleteProduct(b: ISale) {
        this.loadingProducts = true;
        this.confirmService.confirm({title: this.t.instant('confirm.delete'), message: this.t.instant('delete.confirmation.message')})
            .subscribe(res => {
                if (res) {
                    this.productService.delete(b.id).subscribe(value1 => {
                            this.loadingProducts = false;
                            this.getProductsFromServer();
                        },
                        error => {
                            this.loadingProducts = false;
                            this.errorService.error(error);
                            this.snack.open('Ocurrio un error, intente mas tarde', 'OK', {duration: 4000});
                        });
                } else {
                    this.loadingProducts = false;
                }
            })
    }

    editProduct(product: IProduct) {
        this.selectedProduct = product;
        this.viewABMRightSidebar = true;
    }

    saleProduct(product: IProduct) {
        this.selectedProduct = product;
        this.viewSaleRightSidebar = true;
    }

    addToCart(product: IProduct, $event: MouseEvent) {
        // product.state = {...product.state, name: 'incart'};
        // Asegurarse de que tenemos el evento y su target
        if (event && event.target) {
            const element = event.target as HTMLElement;

            if (element) {
                this.cartAnimationService.animate(
                    element,
                    element
                );
            }
        }


        this.cartService.addToCart({
            product: product,
            id: product.id,
            data: {
                quantity: 1
            }
        })
    }

    cancelLateralForm() {
        this.viewABMRightSidebar = false;
        this.viewSaleRightSidebar = false;
    }

    filter(event) {
        const val = event.target.value.toLowerCase();

        this.options.search = val;
        this.getProductsFromServer()


    }

    filterState(filter: any) {
        filter.selected = !filter.selected;
        this.options.states_selected = this.filters_state.filter(f => f.selected).map(fs => fs.id);
    }

    compareDates(a: Moment, b: Moment): number {

        return a.isBefore(b) ? -1 : 1;
    }

    ngOnDestroy() {
        this.getItemSub.forEach(sub => sub.unsubscribe());
        this.getItemSub = [];
    }

    savedProduct() {

    }

    disponible(row: any) {
        return row.state.name === 'disponible' && !this.isInCart(row);
    }

    changeStateFilter($event) {
        if ($event.value.includes(0)) {
            this.states_selected_form.patchValue(this.filters_state);
        }
        this.options.states_selected = $event.value;
        this.getProductsFromServer();
    }

}
