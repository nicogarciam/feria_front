import {Component, OnDestroy, OnInit} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {AppConfirmService} from '@services/app-confirm/app-confirm.service';
import {AppLoaderService} from '@services/app-loader/app-loader.service';
import {HttpResponse} from '@angular/common/http';
import {egretAnimations} from '@animations/egret-animations';
import {TranslateService} from '@ngx-translate/core';
import {IPay} from '@models/pay.model';
import {PayService} from '@services/entities/pay.service';
import {PayPopupComponent} from "@components/pays/pay-popup/pay-popup.component";
import {AppErrorService} from "@services/app-error/app-error.service";
import {JwtAuthService} from "@services/auth/jwt-auth.service";

@Component({
    selector: 'app-pay-crud',
    templateUrl: './pay-crud.component.html',
    styleUrls: ['./pay-crud.component.scss'],
    animations: egretAnimations
})
export class PayCrudComponent implements OnInit, OnDestroy {

    public items: IPay[];
    public getItemSub: Subscription[] = [];
    loading = false;
    options: any;

    constructor(
        private dialog: MatDialog, public jwtAuth: JwtAuthService,
        private snack: MatSnackBar, private payService: PayService,
        private confirmService: AppConfirmService, private loader: AppLoaderService,
        private t: TranslateService, private errorService: AppErrorService
    ) {
        this.options = {
            'store_id' : this.jwtAuth.getStore().id
        }
    }

    ngOnInit() {
        this.getItems()
    }

    ngOnDestroy() {
        this.getItemSub.forEach(sub => sub.unsubscribe());
        this.getItemSub = [];
    }

    getItems() {
        this.loading = true;
        this.getItemSub.push(this.payService.query(this.options)
            .subscribe(res => {
                    (this.items = res.body || []);
                    this.loading = false;
                },
                (error) => {
                    this.errorService.error(error);
                    this.loading = false;
                }
            ));
    }

    openPayPopUp(data: any = {}, isNew?) {

        const title = (isNew ? this.t.instant('newa') : this.t.instant('update'))
            + '  ' + this.t.instant('pay');
        const dialogRef: MatDialogRef<any> = this.dialog.open(PayPopupComponent, {
            width: '850px',
            disableClose: true,
            data: {title: title, item: data}
        })
        dialogRef.afterClosed()
            .subscribe(res => {
                if (!res) {
                    return;
                }
                this.loader.open();
                this.save(res);
            })
    }


    save(item): void {
        if (item.id) {
            this.subscribeToSaveResponse(this.payService.update(item));
        } else {
            this.subscribeToSaveResponse(this.payService.create(item));
        }
    }

    protected subscribeToSaveResponse(result: Observable<HttpResponse<IPay>>): void {
        result.subscribe(
            (res) => this.onSaveSuccess(),
            (error) => this.onSaveError(error.error)
        );
    }

    protected onSaveSuccess(): void {
        this.getItems();
        this.loader.close();
        this.snack.open(this.t.instant('saved.success'), 'OK', {duration: 4000})
    }

    protected onSaveError(error): void {
        this.loader.close();
        this.snack.open('Error: ' + error.message, 'Ups!', {duration: 4000})
    }

    deleteItem(row) {
        const pay = row.id + " " + row.amount;

        const message = this.t.instant('delete.pay', {description: pay} ) + ' ?'
        this.confirmService.confirm({title: this.t.instant('are.you.sure'), message: message})
            .subscribe(res => {
                if (res) {
                    this.loader.open();
                    this.payService.delete(row.id)
                        .subscribe(list => {
                                this.getItems();
                                this.loader.close();
                                this.snack.open(this.t.instant('deleted'), 'OK', {duration: 4000})
                            },
                            (error => {
                                this.loader.close();
                                this.snack.open(this.t.instant('error'), 'Ups!', {duration: 4000})
                            }))
                }
            })
    }

}
