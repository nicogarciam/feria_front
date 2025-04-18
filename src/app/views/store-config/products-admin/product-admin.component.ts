import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {AppConfirmService} from '@services/app-confirm/app-confirm.service';
import {AppLoaderService} from '@services/app-loader/app-loader.service';
import {HttpResponse} from '@angular/common/http';
import {egretAnimations} from '@animations/egret-animations';
import {TranslateService} from '@ngx-translate/core';
import {JwtAuthService} from '@services/auth/jwt-auth.service';
import {CategoryService} from "@services/entities/category.service";
import {ProductService} from "@services/entities/product.service";
import {IProduct, Product} from "@models/product.model";
import {IStore} from "@models/store.model";
import {CategoryPopupComponent} from "./category-popup/category-popup.component";
import {ProductPopupComponent} from "./product-popup/product-popup.component";

@Component({
    selector: 'app-accommodation-admin',
    templateUrl: './product-admin.component.html',
    styleUrls: ['./product-admin.component.scss'],
    animations: egretAnimations
})
export class ProductAdminComponent implements OnInit, OnDestroy {

    public items: IProduct[];
    public store: IStore;
    public loadingItems = false;
    subscriptions: Subscription[] = [];

    constructor(
        private dialog: MatDialog, private snack: MatSnackBar,
        private categoryService: CategoryService, private confirmService: AppConfirmService,
        private loader: AppLoaderService, private t: TranslateService, private productService: ProductService,
        private jwtAuth: JwtAuthService
    ) {
    }

    ngOnInit() {
        this.store = this.jwtAuth.getStore();
        this.getItems();
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => {
            sub.unsubscribe();
        })
        this.subscriptions = [];

    }

    getItems() {
        this.loadingItems = true;
        this.subscriptions.push(this.productService.findByStore(this.store?.id)
            .subscribe((res: HttpResponse<IProduct[]>) => {
                    (this.items = res.body || []);
                    this.loadingItems = false;
                },
                (error) => {
                    console.log(error);
                    this.loadingItems = false;
                }
            ));

    }

    openPopUp(data: any = {}, isNew?) {

        const title = (isNew ? this.t.instant('new') : this.t.instant('update'))
            + '  ' + this.t.instant('accommodation');
        const dialogRef: MatDialogRef<any> = this.dialog.open(ProductPopupComponent, {
            width: '720px',
            disableClose: true,
            data: {title: title, item: data}
        })
        dialogRef.afterClosed()
            .subscribe(res => {
                if (!res) {
                    // If user press cancel
                    return;
                }
                this.getItems();
            })
    }


    openAccommodationTypePopUp(data: any = {}) {

        const title = this.t.instant('accommodation.types');
        const dialogRef: MatDialogRef<any> = this.dialog.open(CategoryPopupComponent, {
            width: '720px',
            disableClose: true,
            data: {title: title, item: data}
        })
        dialogRef.afterClosed()
            .subscribe(res => {
                if (!res) {
                    // If user press cancel
                    return;
                }
            })
    }

    deleteItem(row) {
        let message = this.t.instant('constraint.warring.accommodation');
        message += '. ' + this.t.instant('delete') + ' ' + row.code + ' - ' +  + row.name + '?';
        this.subscriptions.push(this.confirmService.confirm({title: this.t.instant('are.you.sure'), message: message})
            .subscribe(res => {
                if (res) {
                    this.loader.open();
                    this.subscriptions.push(this.productService.delete(row.id)
                        .subscribe(list => {
                                this.getItems();
                                this.loader.close();
                                this.snack.open(this.t.instant('deleted'), 'OK', {duration: 4000})
                            },
                            (error => {
                                this.loader.close();
                                this.snack.open(this.t.instant('error'), 'Ups!', {duration: 4000})
                            })))
                }
            }))
    }

    copyItem(acc: IProduct) {
        const accCopy: IProduct = new Product(acc);
        accCopy.id = null;
        this.openPopUp(accCopy, true);
    }
}
