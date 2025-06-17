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
    selector: 'app-product-list',
    templateUrl: './product-list.component.html',
    styleUrls: ['./product-list.component.scss'],
    animations: egretAnimations,
    providers: [
        {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
        {provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS},
    ],
})
export class ProductListComponent implements OnInit, OnDestroy {


    public selectedProduct: IProduct;
    public getItemSub: Subscription[] = [];
    @Input() viewABMRightSidebar = false;
    @Input() viewSaleRightSidebar = false;

    _layout = { layout: 'full', actions: true};

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


    cart$: Observable<CartItem[]>;
    public cartProducts: IProduct[] = [];


    constructor(public jwtAuth: JwtAuthService,
                private dialog: MatDialog, private snack: MatSnackBar, protected cartQuery: CartQuery,
                private confirmService: AppConfirmService, private errorService: AppErrorService,
                private productService: ProductService, private t: TranslateService,
                private cartService: CartService, private productStateService: ProductStateService,
                private cartAnimationService: CartAnimationService) {

    }

    ngOnInit(): void {
        this.cart$ = this.cartQuery.selectAll();
        this.cart$.subscribe(carItems => {
           this.cartProducts = carItems.map(c => c.product);
        });
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
        product.state = {...product.state, name: 'incart'};

        // Eliminando código redundante ya que la animación ya se ha disparado arriba

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



    ngOnDestroy() {
        this.getItemSub.forEach(sub => sub.unsubscribe());
        this.getItemSub = [];
    }


}
