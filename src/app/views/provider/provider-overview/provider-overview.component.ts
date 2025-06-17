import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {IPay} from '@models/pay.model';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {AppLoaderService} from '@services/app-loader/app-loader.service';
import {TranslateService} from '@ngx-translate/core';
import {Subscription} from 'rxjs';
import {MatSnackBar} from '@angular/material/snack-bar';
import {egretAnimations} from '@animations/egret-animations';
import {IProvider} from "@models/Provider.model";
import {AppErrorService} from "@services/app-error/app-error.service";
import {ISale} from "@models/sale.model";
import {SaleService} from "@services/entities/sale.service";
import {HttpResponse} from "@angular/common/http";
import {IMovement, Movement} from "@models/movement.model";
import {MovementsService} from "@services/entities/movements.service";
import * as moment from "moment";
import {IBalance} from "@models/balance.model";
import {JwtAuthService} from "@services/auth/jwt-auth.service";
import {ProductService} from "@services/entities/product.service";
import {IProduct} from "@models/product.model";
import {Pageable} from "@models/pageable.model";
import {MovementPopupComponent} from "@components/movement-popup/movement-popup.component";
import {ImageService} from "@services/image.service";

@Component({
    selector: 'app-provider-overview',
    templateUrl: './provider-overview.component.html',
    styleUrls: ['./provider-overview.component.css'],
    animations: egretAnimations
})
export class ProviderOverviewComponent implements OnInit, OnDestroy {


    subscriptions: Subscription[] = [];

    pays: IPay[] = [];
    sales: ISale[] = [];
    products: IProduct[] = [];
    movements: IMovement[] = [];
    balance: IBalance;
    loadingPays = false;
    loadingSales = false;
    loadingProducts = false;
    loadingBalance = false;
    loadingProvider = false;
    selectedImage = null;
    imageError: string;

    @Output() providerChange = new EventEmitter();
    @Output() cancel = new EventEmitter();
    @Output() saved = new EventEmitter();


    _provider: IProvider;

    @Input()
    set provider(value: IProvider) {
        if (value !== undefined) {
            this._provider = value;
            this.updateData();
            this.providerChange.emit(this._provider);
        }

    };

    get provider() {
        return this._provider;
    }


    constructor(
        private loader: AppLoaderService,
        private dialog: MatDialog, private t: TranslateService,
        private snack: MatSnackBar, private movementService: MovementsService, public jwtAuth: JwtAuthService,
        private saleService: SaleService, private error: AppErrorService,
        private productService: ProductService, public imageService: ImageService) {
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
        this.getProvider();
        this.getBalance();
    }

    getProvider() {
       this.loadingProvider = true;

    }
    // 'date_from':  moment().subtract(1, 'M').startOf('month').startOf('hour').toISOString(),
    getBalance() {
        const options = {
            'for': {'provider_id': this.provider.id, 'store_id': this.jwtAuth.getStore().id},
            'date_to': moment().endOf('hour').toISOString(),
        }
        this.loadingBalance = true;
        this.subscriptions.push(this.movementService.queryBalance(options)
            .subscribe((res: HttpResponse<IBalance>) => {
                    (this.balance = res.body);
                    console.log(this.balance);
                    this.loadingBalance = false;
                },
                (error) => {
                    this.error.error(error);
                    this.loadingBalance = false;
                }
            ));
    }

    getProducts() {
        this.loadingProducts = true;
        this.subscriptions.push(this.productService.queryPage({'provider_id': this.provider.id,
            'store_id': this.jwtAuth.getStore().id  })
            .subscribe((res: HttpResponse<Pageable>) => {
                    (this.products = res.body.data || []);
                    this.loadingProducts = false;
                },
                (error) => {
                    this.error.error(error);
                    this.loadingProducts = false;
                }
            ));
    }

    addProduct() {

    }


    openMovementPopUp(isNew: boolean, movement: IMovement = null) {
        const title = (isNew ? this.t.instant('newa') : this.t.instant('update'))
            + '  ' + this.t.instant('movement');

        movement = new Movement({
            ...movement,
            'provider_id': this.provider.id,
            'provider': this.provider,
            'store_id': this.jwtAuth.getStore().id
        });

        const dialogRef: MatDialogRef<any> = this.dialog.open(MovementPopupComponent, {
            width: '850px',
            disableClose: true,
            data: {title: title, item: movement}
        })
        dialogRef.afterClosed()
            .subscribe(res => {
                if (res) {
                    this.getBalance();
                    return;
                }
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
                this.imageError = 'Maximum size allowed is ' + max_size / 1000 + 'Mb';
                this.loader.close()
                return false;
            }

            if (!allowed_types.includes(fileInput.target.files[0].type)) {
                this.imageError = 'Only Images are allowed ( JPG | PNG )';
                this.loader.close()
                return false;
            }
            const reader = new FileReader();
            reader.onload = (e: any) => {
                const image = new Image();
                image.src = e.target.result;
                image.onload = rs => {
                    const img_height = rs.currentTarget['height'];
                    const img_width = rs.currentTarget['width'];
                    if (img_height > max_height && img_width > max_width) {
                        this.imageError =
                            'Maximum dimentions allowed ' +
                            max_height +
                            '*' +
                            max_width +
                            'px';
                        this.loader.close()
                        return false;
                    } else {
                        this.loader.close()
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
        formData.append('provider_id', this.provider.id.toString());
        this.subscriptions.push(this.productService.queryPage({'provider_id': this.provider.id,
            'store_id': this.jwtAuth.getStore().id  })
            .subscribe((res: HttpResponse<Pageable>) => {
                    (this.products = res.body.data || []);
                    this.loadingProducts = false;
                },
                (error) => {
                    this.error.error(error);
                    this.loadingProducts = false;
                }
            ))
        this.loader.close()
    }
}
