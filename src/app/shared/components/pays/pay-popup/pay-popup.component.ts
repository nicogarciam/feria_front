import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {DateAdapter, MAT_DATE_FORMATS} from '@angular/material/core';
import * as moment from 'moment';
import {APP_DATE_FORMATS, AppDateAdapter} from '@helpers/format-datepicker';
import {egretAnimations} from '@animations/egret-animations';
import {AccountService} from '@services/entities/account.service';
import {PayService} from '@services/entities/pay.service';
import {getPayMethod, IPay, Pay, payTypes} from '@models/pay.model';
import {TranslateService} from '@ngx-translate/core';
import {Observable} from 'rxjs';
import {HttpResponse} from '@angular/common/http';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ISale} from "@models/sale.model";
import {JwtAuthService} from "@services/auth/jwt-auth.service";
import {AppErrorService} from "@services/app-error/app-error.service";
import {BankAccountService} from "@services/entities/bankAccount.service";
import {ICustomer} from "@models/customer.model";
import {VoucherService} from "@services/entities/vouchers.service";
import {IVoucher} from "@models/voucher.model";

@Component({
    selector: 'app-pay-popup',
    templateUrl: './pay-popup.component.html',
    styleUrls: ['./pay-popup.component.scss'],
    providers: [
        {provide: DateAdapter, useClass: AppDateAdapter},
        {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
    ],
    animations: egretAnimations
})
export class PayPopupComponent implements OnInit {
    public itemForm: FormGroup;
    isLoading = true;
    paying = false;
    findingVoucher = false;
    voucherError = null;
    selectedVoucher: IVoucher;
    pay: IPay;
    discount_code = new FormControl();
    cash = {amount: 0}
    sale: ISale;
    banksAccounts = [];
    pay_types = [];

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: { title: string, sale: ISale, customer: ICustomer },
        public dialogRef: MatDialogRef<PayPopupComponent>, private errorService: AppErrorService,
        private fb: FormBuilder, private voucherService: VoucherService,
        private payService: PayService, private bankAccountService: BankAccountService,
        private t: TranslateService, private snack: MatSnackBar, private authService: JwtAuthService
    ) {

        this.sale = data.sale;

        const concept = this.sale ? this.t.instant('pay') + ' ' + this.t.instant('store') + ' ' + this.sale.code : '';
        this.pay = new Pay({
            pay_date: moment(),
            pay_method: 'cash',
            sale_id: this.sale?.id,
            concept: concept,
            type: 'PAY',
            discount: 0,
            state: 'NEW',
            user_id: this.authService.getUser().id,
            store_id: this.authService.getStore().id,
            user: this.authService.getUser().email,
            customer_id: this.sale && this.sale.customer ? this.sale.customer.id : this.data.customer ? this.data.customer.id : null
        });
        this.setPayMethod(1);
        this.buildItemForm(this.pay);

    }

    ngOnInit() {
        this.pay_types = payTypes;
        this.pay.user_id = this.authService.user.id;
        this.bankAccountService.query({store_id: this.authService.getStore().id}).subscribe(res => {
                this.banksAccounts = res.body;
            },
            error => {
                this.errorService.error(error);
            })
    }

    totalPaid() {
        return 0;
    }

    buildItemForm(pay: IPay) {
        this.discount_code = new FormControl(this.pay.discount_cod);

        this.itemForm = this.fb.group({
            id: pay.id,
            pay_date: [pay.pay_date, [Validators.required]],
            concept: [pay.concept, [Validators.required]],
            type: [pay.type, [Validators.required]]
        })
    }

    getBookingPays() {
        this.payService.query({'store_id': this.sale.id})
            .subscribe(res => {
                    (this.sale.pays = res.body || []);
                },
                (error) => {
                    console.log(error);
                    this.errorService.error(error);
                }
            );
    }

    compareFn(o1: any, o2: any) {
        return o1 && o2 ? (o1.id === o2.id) : false;
    }

    submit() {
        console.log("SUBMIT");

        switch (this.pay.pay_method) {
            case 1: {
                this.payCash();
                break;
            }
            case 2: {
                // MERCADO PAGO;
                this.payMercadoPago();
                break;
            }
            case 3: {
                // TRANSFERENCIA BANCARIA;
                this.payBank();
                break;
            }
            default: {
                // statements;
                break;
            }

        }
    }

    private createFromForm(): IPay {
        return {
            ...this.pay,
            pay_date: this.itemForm.get(['pay_date'])!.value,
            concept: this.itemForm.get(['concept'])!.value,
            type: this.itemForm.get(['type'])!.value,
        };
    }


    public componentMethod(event) {
        event.target.select();
    }

    totalToPay() {
        return this.sale ? this.sale.total_price - (this.pay.discount || 0) - this.totalPaid() : 0;
    }

    findVoucher() {
        if (this.discount_code?.value?.length < 3) {
            return false;
        }
        this.findingVoucher = true;
        this.voucherError = null;
        this.discount_code.setErrors(null);
        this.voucherService.query({cod: this.discount_code.value, state: 'ACTIVE'}).subscribe(
            value => {
                if (value.body.length > 1) {
                    this.selectedVoucher = value.body[0];
                    this.voucherError = null;
                } else {
                    this.discount_code.setErrors({
                        notFound: true
                    });
                    this.voucherError = this.t.instant('no.voucher.found');
                }
                this.findingVoucher = false;
            },
            error => {
                this.selectedVoucher = null;
                this.findingVoucher = false;
                this.voucherError = this.t.instant('no.voucher.found');
            }
        )
    }

    setPayMethod(id: number) {
        const pm = getPayMethod(id);
        this.cash.amount = this.totalToPay();
        this.pay.pay_method = pm.id;
        this.pay.pay_method_dsc = pm.dsc;
    }


    payCash(): void {
        console.log('PAyCASH')
        this.paying = true;
        this.pay = this.createFromForm();
        if (this.pay.id) {
            this.subscribeToSaveResponse(this.payService.update(this.pay));
        } else {
            this.subscribeToSaveResponse(this.payService.create(this.pay));
        }
    }


    payBank() {
        this.paying = true;
        this.pay = this.createFromForm();
        if (this.pay.id) {
            this.subscribeToSaveResponse(this.payService.update(this.pay));
        } else {
            this.subscribeToSaveResponse(this.payService.create(this.pay));
        }
    }

    payCreditCard() {

    }

    payMercadoPago() {

    }

    protected subscribeToSaveResponse(result: Observable<HttpResponse<IPay>>): void {
        result.subscribe(
            (res) => this.onSaveSuccess(res.body),
            (error) => this.onSaveError(error.error)
        );
    }

    protected onSaveSuccess(pay: IPay): void {

        this.paying = false;
        this.dialogRef.close(true);
    }

    protected onSaveError(error): void {
        // this.loader.close();
        this.paying = false;
        this.snack.open('Error: ' + error.message, 'Ups!', {duration: 4000})
    }


    close() {
        this.dialogRef.close('ok');
    }

    compareById(obj1, obj2) {
        return obj1 && obj2 && obj1.id === obj2.id;
    }


}
