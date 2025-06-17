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
import {ActivatedRoute, Router} from "@angular/router";
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


    new_state = new FormControl(false);
    loading = false;
    _product: IProduct = new Product({});

    loadingSale = true;
    loadingPays = true;

    public photoGallery: any[] = [{url: '', state: '0'}];

    loadingStates = false;

    @Output() cancel = new EventEmitter();
    @Output() saved = new EventEmitter();


    @Input()
    productID;


    @Input()
    get product(): IProduct {
        return this._product;
    }

    set product(value: IProduct) {
        if (value !== undefined) {
            this._product = value;
            this.new_state = new FormControl(this._product.state_id);
        }
    }
    
    constructor(private fb: FormBuilder, private confirmService: AppConfirmService,
                private errorService: AppErrorService, private route: ActivatedRoute,
                private loader: AppLoaderService, private productService: ProductService,
                private t: TranslateService, public layout: LayoutService,
                private snack: MatSnackBar, private router: Router) {
    }

    ngOnInit() {

        this.loader.open();
        this.layout.setProperty({useBreadcrumb: true})
        this.productID = this.route.snapshot.params.productID;
        this.getItemSub.push(
            this.productService.find(this.productID)
            .subscribe((res) => {
                    (this.product = res.body);
                    this.initGallery(this.product);
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




    initGallery(product: IProduct) {
        if (!product.gallery) {
            return;
        }
        this.photoGallery = product.gallery.map(i => {
            return {
                url: i,
                state: '0'
            }
        });
        if (this.photoGallery[0]) {
            this.photoGallery[0].state = '1';
        }
    }

    editProduct(product: IProduct) {


    }

    deleteProduct() {
        this.loading = true;
        this.confirmService.confirm({title: this.t.instant('confirm.delete'), message: this.t.instant('delete.confirmation.message')})
            .subscribe(res => {
                if (res) {
                    this.productService.delete(this._product.id).subscribe(value1 => {
                            this.loading = false;
                            this.router.navigate(['/products']);
                        },
                        error => {
                            this.loading = false;
                            this.errorService.error(error);
                            this.snack.open('Ocurrio un error, intente mas tarde', 'OK', {duration: 4000});
                        });
                } else {
                    this.loading = false;
                }
            })
    }


    ngOnDestroy() {
        this.getItemSub.forEach(sub => sub.unsubscribe());
        this.getItemSub = [];
        this.layout.setProperty({useBreadcrumb: false})
    }

}
