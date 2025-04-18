import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {IPay} from '@models/pay.model';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {AppLoaderService} from '@services/app-loader/app-loader.service';
import {TranslateService} from '@ngx-translate/core';
import {BehaviorSubject, Subscription} from 'rxjs';
import {PayService} from '@services/entities/pay.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {egretAnimations} from '@animations/egret-animations';
import {ICustomer} from "@models/customer.model";
import {AppErrorService} from "@services/app-error/app-error.service";
import {ISale} from "@models/sale.model";
import {SaleService} from "@services/entities/sale.service";
import {HttpResponse} from "@angular/common/http";
import {PayPopupComponent} from "@components/pays/pay-popup/pay-popup.component";
import {IMovement} from "@models/movement.model";
import {MovementsService} from "@services/entities/movements.service";
import * as moment from "moment";
import {IBalance} from "@models/balance.model";
import {JwtAuthService} from "@services/auth/jwt-auth.service";

@Component({
    selector: 'app-customer-overview',
    templateUrl: './customer-overview.component.html',
    styleUrls: ['./customer-overview.component.css'],
    animations: egretAnimations
})
export class CustomerOverviewComponent implements OnInit, OnDestroy {


    subscriptions: Subscription[] = [];

    pays: IPay[] = [];
    sales: ISale[] = [];
    movements: IMovement[] = [];
    balance: IBalance;
    loadingPays = false;
    loadingSales = false;
    loadingBalance = false;
    loadingCustomer = false;
    selectedImage = null;
    imageError: string;

    @Output() customerChange = new EventEmitter();
    @Output() cancel = new EventEmitter();
    @Output() saved = new EventEmitter();


    _customer: ICustomer;

    @Input()
    set customer(value: ICustomer) {
        if (value !== undefined) {
            this._customer = value;
            this.updateData();
            this.customerChange.emit(this._customer);
        }

    };

    get customer() {
        return this._customer;
    }


    constructor(
        private loader: AppLoaderService,
        private dialog: MatDialog, private payService: PayService, private t: TranslateService,
        private snack: MatSnackBar, private movementService: MovementsService, public jwtAuth: JwtAuthService,
        private saleService: SaleService, private error: AppErrorService) {
    }

    ngOnInit() {

    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => {
            sub.unsubscribe();
        })
        this.subscriptions = [];
    }

    updateData() {
        this.getCustomer();
        this.getSales();
        this.getPays();
        // this.getMovements();
        this.getBalance();
    }

    getCustomer() {
       this.loadingCustomer = true;

    }

    getBalance() {
        const options = {
            'for': {'customer_id': this.customer.id, 'hotel_id': this.jwtAuth.getStore().id},
            'date_from':  moment().subtract(1, 'M').startOf('month').startOf('hour').toISOString(),
            'date_to': moment().endOf('month').endOf('hour').toISOString(),
        }
        this.loadingBalance = true;
        this.subscriptions.push(this.movementService.queryBalance(options)
            .subscribe((res: HttpResponse<IBalance>) => {
                    (this.balance = res.body);
                    this.loadingBalance = false;
                },
                (error) => {
                    this.error.error(error);
                    this.loadingBalance = false;
                }
            ));
    }

    getSales() {
        this.loadingSales = true;
        this.subscriptions.push(this.saleService.query({'customer_id': this.customer.id})
            .subscribe((res: HttpResponse<ISale[]>) => {
                    (this.sales = res.body || []);
                    this.loadingSales = false;
                },
                (error) => {
                    this.error.error(error);
                    this.loadingSales = false;
                }
            ));
    }



    getPays() {
        this.loadingPays = true;
        this.subscriptions.push(this.payService.query({'customer_id': this.customer.id})
            .subscribe((res: HttpResponse<IPay[]>) => {
                    (this.pays = res.body || []);
                    this.loadingPays = false;
                },
                (error) => {
                    this.error.error(error);
                    this.loadingPays = false;
                }
            ));
    }

    addPayPopup() {

        const dialogRef: MatDialogRef<any> = this.dialog.open(PayPopupComponent, {
            width: '820px',
            disableClose: true,
            data: {customer: this.customer}
        })
        dialogRef.afterClosed()
            .subscribe(res => {
                if (!res) {
                    return;
                }
                this.getPays();
                this.snack.open(this.t.instant('saved.success'), 'OK', {duration: 4000})
            })
    }


    fileChangeEvent(fileInput: any) {
        this.loader.open()
        this.imageError = null;
        if (fileInput.target.files && fileInput.target.files[0]) {
            // Size Filter Bytes
            const max_size = 20971520;
            const allowed_types = ['image/png', 'image/jpeg'];
            const max_height = 15200;
            const max_width = 25600;

            if (fileInput.target.files[0].size > max_size) {
                this.imageError =
                    'Maximum size allowed is ' + max_size / 1000 + 'Mb';
                return false;
            }

            if (!allowed_types.includes(fileInput.target.files[0].type)) {
                this.imageError = 'Only Images are allowed ( JPG | PNG )';
                return false;
            }
            const reader = new FileReader();
            reader.onload = (e: any) => {
                const image = new Image();
                image.src = e.target.result;
                image.onload = rs => {
                    const img_height = rs.currentTarget['height'];
                    const img_width = rs.currentTarget['width'];

                    console.log(img_height, img_width);

                    if (img_height > max_height && img_width > max_width) {
                        this.imageError =
                            'Maximum dimentions allowed ' +
                            max_height +
                            '*' +
                            max_width +
                            'px';
                        return false;
                    } else {

                        this.selectedImage = fileInput.target.files[0];
                        this.updateLogo();
                    }
                };
            };

            reader.readAsDataURL(fileInput.target.files[0]);
        }
    }

    updateLogo() {
        const formData = new FormData();
        formData.append('image', this.selectedImage, this.selectedImage.name);
        formData.append('customer_id', this.customer.id.toString());

        // this.subscriptions.push(this.accountService.updateImage(formData).subscribe(
        //     (res) => {
        //         this.account = res.body;
        //
        //         this.onSaveSuccess();
        //     },
        //     (error) => this.onSaveError(error.error)));
    }


}
