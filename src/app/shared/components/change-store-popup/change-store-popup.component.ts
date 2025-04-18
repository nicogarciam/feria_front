import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormGroup} from '@angular/forms';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import {egretAnimations} from "@animations/egret-animations";
import {TranslateService} from "@ngx-translate/core";
import {MatSnackBar} from "@angular/material/snack-bar";
import {APP_DATE_FORMATS, AppDateAdapter} from "../../helpers/format-datepicker";
import {StoreService} from "@services/entities/store.service";
import {IStore} from "@models/store.model";
import {JwtAuthService} from "@services/auth/jwt-auth.service";
import {Subscription} from "rxjs";
import {AppErrorService} from "@services/app-error/app-error.service";

@Component({
    selector: 'app-change-hotel-popup',
    templateUrl: './change-store-popup.component.html',
    styleUrls: ['./change-store-popup.component.scss'],
    animations: egretAnimations
})

export class ChangeStorePopupComponent implements OnInit, OnDestroy {
    public itemForm: FormGroup;
    subscriptions: Subscription[] = [];

    _store: IStore;

    isLoading = false;
    stores: IStore[] = [];

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: { title: string, item: IStore },
        public dialogRef: MatDialogRef<ChangeStorePopupComponent>, private storeService: StoreService,
        private t: TranslateService, private snack: MatSnackBar, public jwtAuth: JwtAuthService,
        private error: AppErrorService
    ) {

    }

    ngOnInit() {
        this._store = this.jwtAuth.getStore();
        this.getItems();

    }


    getItems() {
        this.isLoading = true;
        this.subscriptions.push(this.storeService.myStores().subscribe(h => {
                    this.stores = h.body;
                    this.isLoading = false;
                },
                error => {
                    this.isLoading = false;
                    this.error.error(error);
                    console.log("Error storeService.find")
                })
        )
    }
    close() {
        this.dialogRef.close();
    }

    protected onSaveError(error): void {
        this.snack.open('Error: ' + error.message, 'Ups!', {duration: 4000})
    }
    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => {
            sub.unsubscribe();
        })
        this.subscriptions = [];
    }

    selectHotel(h: IStore) {
        this.subscriptions.push(this.storeService.selectStore(h).subscribe(store => {
                this.jwtAuth.setStore(store.body);
                this.isLoading = false;
            },
            error => {
                this.isLoading = false;
                this.error.error(error);
            }))
    }
}
