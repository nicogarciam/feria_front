import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {HttpResponse} from '@angular/common/http';
import {DateAdapter, MAT_DATE_FORMATS} from '@angular/material/core';
import {IProduct, Product} from "@models/product.model";
import {ICategory} from "@models/category.model";
import {ProductService} from "@services/entities/product.service";
import {CategoryService} from "@services/entities/category.service";
import {APP_DATE_FORMATS, AppDateAdapter} from "@helpers/format-datepicker";
import {IStore} from "@models/store.model";
import {IAccount} from "@models/account.model";
import {CityService} from "@services/entities/city.service";
import {AccountService} from "@services/entities/account.service";
import {JwtAuthService} from "@services/auth/jwt-auth.service";
import {Observable, Subscription} from "rxjs";
import {AppLoaderService} from "@services/app-loader/app-loader.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {TranslateService} from "@ngx-translate/core";

@Component({
    selector: 'app-product-popup',
    templateUrl: './product-popup.component.html',
    providers: [
        {provide: DateAdapter, useClass: AppDateAdapter},
        {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
    ]
})
export class ProductPopupComponent implements OnInit, OnDestroy {
    public itemForm: FormGroup;
    public accommodationTypes: ICategory[];
    isLoadingAccounts = false;
    searchAccount = false;
    public hotel: IStore;
    subscriptions: Subscription[] = [];

    public filteredAccounts: IAccount[] = [];


    constructor(
        @Inject(MAT_DIALOG_DATA) public data: { title: string, item: IProduct },
        public dialogRef: MatDialogRef<ProductPopupComponent>, private fb: FormBuilder,
        private categoryService: CategoryService, private productService: ProductService,
        public jwtAuth: JwtAuthService, private loader: AppLoaderService, private snack: MatSnackBar,
        private t: TranslateService
    ) {
    }

    ngOnInit() {
        this.hotel = this.jwtAuth.getStore();
        this.buildItemForm(this.data.item);
        this.subscriptions.push(this.categoryService.findByStore(this.hotel?.id)
            .subscribe((res: HttpResponse<ICategory[]>) =>
                    (this.accommodationTypes = res.body || []),
                (error) => console.log(error)
            ));

    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => {
            sub.unsubscribe();
        })
        this.subscriptions = [];
    }

    buildItemForm(product: IProduct) {
        // console.log(membership);
        this.itemForm = this.fb.group({
            id: product.id,
            code: [product.code, Validators.required],
            name: [product.name, Validators.required],
            state: product.state,
            description: product.description,
            store: product.store || this.hotel,
            category: [product.category, Validators.required],

        })

    }

    compareFn(o1: any, o2: any) {
        return o2 && (o1.id === o2.id);
    }


    submit() {
        this.save(this.createFromForm());
    }


    save(item): void {
        if (item.id) {
            this.subscribeToSaveResponse(this.productService.update(item));
        } else {
            this.subscribeToSaveResponse(this.productService.create(item));
        }
    }

    protected subscribeToSaveResponse(result: Observable<HttpResponse<IProduct>>): void {
        this.subscriptions.push(
            result.subscribe(
            (res) => this.onSaveSuccess(),
            (error) => this.onSaveError(error.error)
        ));
    }

    protected onSaveSuccess(): void {
        this.snack.open(this.t.instant('saved.success'), 'OK', {duration: 4000})
        this.dialogRef.close("ok");
        this.loader.close();

    }

    protected onSaveError(error): void {
        this.snack.open('Error: ' + error.message, 'Ups!', {duration: 4000});
    }

    private createFromForm(): IProduct {

        return {
            ...new Product(),
            id: this.itemForm.get(['id'])?.value,
            code: this.itemForm.get(['code'])?.value,
            name: this.itemForm.get(['name'])?.value,
            state: this.itemForm.get(['state'])?.value,
            description: this.itemForm.get(['description'])?.value,
            store: this.itemForm.get(['hotel'])?.value,
            store_id: this.hotel?.id,
            category: this.itemForm.get(['category'])?.value
        };
    }


    public componentMethod(event) {
        event.target.select();
    }
}
