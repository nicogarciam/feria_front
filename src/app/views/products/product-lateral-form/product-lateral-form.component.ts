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
import {Discount, IDiscount} from "@models/discount.model";
import {DiscountService} from "@services/entities/discount.service";
import {ICustomer} from "@models/customer.model";
import {CustomerPopupComponent} from "@components/customer-popup/customer-popup.component";
import {CustomerService} from "@services/entities/customer.service";
import {IProduct, Product} from "@models/product.model";
import {ProductService} from "@services/entities/product.service";
import {IProductState} from "@models/product-state.model";
import {ICategory} from "@models/category.model";
import {IStore, Store} from "@models/store.model";
import {ISale} from "@models/sale.model";
import {ProviderService} from "@services/entities/provider.service";
import {IProvider} from "@models/provider.model";
import {ProductStateService} from "@services/entities/productState.service";
import {HttpResponse} from "@angular/common/http";
import {CategoryService} from "@services/entities/category.service";
import {JwtAuthService} from "@services/auth/jwt-auth.service";
import {ProviderPopupComponent} from "@components/provider-popup/provider-popup.component";

@Component({
    selector: 'app-product-lateral-form',
    templateUrl: './product-lateral-form.component.html',
    styleUrls: ['./product-lateral-form.component.scss'],
    providers: [
        {provide: DateAdapter, useClass: AppDateAdapter},
        {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
    ],
    animations: egretAnimations
})
export class ProductLateralFormComponent implements OnInit, OnDestroy {

    public getItemSub: Subscription[] = [];
    customer_search = new FormControl(false);
    provider_search = new FormControl(false);

    new_state = new FormControl(false);

    filteredCustomers: ICustomer[] = [];
    filteredProviders: IProvider[] = [];
    loading = false;
    loadingPays = false;
    loadingPrice = false;
    loadingDiscounts = false;
    loadingProviders = false;

    extended = false;
    forCustomer = false;

    _product: IProduct;
    productStates: IProductState[] = [];
    store: IStore = new Store();

    public itemForm: FormGroup;

    categories: ICategory[] = [];
    public photoGallery: any[] = [{url: '', state: '0'}];
    public previewImage: string | null = null;

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
                private customerService: CustomerService, private categoryService: CategoryService) {

    }

    ngOnInit() {
        this.store = this.jwtAuth.getStore();

        // this.getItemSub.push(this.customer_search.valueChanges
        //     .pipe(
        //         debounceTime(100),
        //         tap(() => this.loading = true),
        //         switchMap(value => this.customerService.query({q: value})
        //             .pipe(
        //                 finalize(() => this.loading = false),
        //             )
        //         )
        //     ).subscribe(
        //         (result) =>
        //             this.filteredCustomers = result.body,
        //         (error) => console.log('Error ', error),
        //     ));

        this.getItemSub.push(this.provider_search.valueChanges
            .pipe(
                debounceTime(70),
                tap(() => this.loadingProviders = true),
                switchMap(value => this.providerService.query({q: value})
                    .pipe(
                        finalize(() => this.loadingProviders = true),
                    )
                )
            ).subscribe(
                (result) => {
                    this.loadingProviders = true;
                    this.filteredProviders = result.body
                } ,
                (error) => {
                    console.log('Error ', error);
                    this.loadingProviders = true;
                },
            ));

        this.getData();

    }


    private getData() {
        console.log("getData");
        this.getStates();
        this.getCategories();
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

    private getCategories() {
        this.getItemSub.push(this.categoryService.query()
            .subscribe((res: HttpResponse<ICategory[]>) => {
                    (this.categories = res.body || [])
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

        })
    }

    private createFromForm(): IProduct {
        return {
            ...new Product(),
            id: this.itemForm.get(['id'])!.value,
            description: this.itemForm.get(['description'])!.value,
            code: this.itemForm.get(['code'])!.value,
            name: this.itemForm.get(['name'])!.value,
            category_id: this.itemForm.get(['category_id'])!.value,
            provider_id: this.itemForm.get(['provider_id'])!.value,
            state_id: this.itemForm.get(['state_id'])!.value,
            store: this.store,

            color: this.itemForm.get(['color'])!.value,
            size: this.itemForm.get(['size'])!.value,
            price: this.itemForm.get(['price'])!.value,
            cost: this.itemForm.get(['cost'])!.value,
            note: this.itemForm.get(['note'])!.value,

        };
    }


    displayCustomerFn = (item?: any) => {
        if (item && item === 'new') {
            this.addCustomer({}, true);
        } else if (item) {
            this._product.sale.customer = item;
        }
    }

     displayProviderFn = (item?: any) => {
         if (item && item === 'new') {
             this.addProvider({}, true);
             return '';
         } else if (item) {
             this._product.provider = item;
             this._product.provider_id = item.id;
             return item.name;
         } else {
             return '';
         }
     }


    public productStateCompare = function (option, value): boolean {
        return option.id === value.state_id;
    }


    cancelSelection(): void {
        this._product = new Product();
        this.cancel.emit();
    }


    saveProduct(): void {
        this.loader.open();
        this.loading = true;

        this._product = this.createFromForm();
        // VALIDATION

        if (this._product.id) {
            this.getItemSub.push(this.productService.update(this._product).subscribe(b => {
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
            this.getItemSub.push(this.productService.create(this._product).subscribe(b => {
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

    deleteProduct() {

        this.confirmService.confirm({title: this.t.instant('confirm.delete'), message: this.t.instant('delete.confirmation.message')})
            .subscribe(res => {
                this.loading = true;
                this.loader.open();
                if (res) {
                    this.getItemSub.push(this.productService.delete(this._product.id).subscribe(value1 => {
                            this.loading = false;
                            this.loader.close();
                            this.saved.emit();
                        },
                        error => {
                            this.loading = false;
                            this.loader.close();
                            this.errorService.error(error);
                            this.snack.open('Ocurrio un error, intente mas tarde', 'OK', {duration: 4000});
                        }));
                } else {
                    this.loading = false;
                    this.loader.close();
                }

            })
    }

    public componentMethod(event) {
        event.target.select();
    }


    toggleExtended() {
        this.extended = !this.extended;
    }


    ngOnDestroy() {
        this.getItemSub.forEach(sub => sub.unsubscribe());
        this.getItemSub = [];
    }

    private addProvider(data: {}, isNew: boolean) {

        const title = (isNew ? this.t.instant('new') : this.t.instant('update'))
            + '  ' + this.t.instant('provider');
        const dialogRef: MatDialogRef<any> = this.dialog.open(ProviderPopupComponent, {
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

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const file = input.files[0];
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.previewImage = e.target.result;
                // Agregar la imagen a la galería
                this.photoGallery.push({ url: e.target.result, state: '0' });
            };
            reader.readAsDataURL(file);
        }
    }

}
