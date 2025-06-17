import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {DateAdapter, MAT_DATE_FORMATS} from '@angular/material/core';
import {APP_DATE_FORMATS, AppDateAdapter} from '@helpers/format-datepicker';
import {egretAnimations} from '@animations/egret-animations';
import {MatDialog} from '@angular/material/dialog';
import {AppConfirmService} from '@services/app-confirm/app-confirm.service';
import {debounceTime, finalize, switchMap, tap} from 'rxjs/operators'; // finalize is correctly here
import {AppErrorService} from '@services/app-error/app-error.service';
import {Subscription} from 'rxjs';
import {IProduct, Product} from '@models/product.model';
import {ProductService} from '@services/entities/product.service';
import {IProductState} from '@models/product-state.model';
import {ICategory} from '@models/category.model';
import {IStore, Store} from '@models/store.model';
import {ProviderService} from '@services/entities/provider.service';
import {IProvider} from '@models/provider.model';
import {ProductStateService} from '@services/entities/productState.service';
import {HttpResponse} from '@angular/common/http';
import {CategoryService} from '@services/entities/category.service';
import {JwtAuthService} from '@services/auth/jwt-auth.service';
import {ProviderPopupComponent} from "@components/providers/provider-popup/provider-popup.component";
import {GalleryImage} from "@models/image.model";
import {AiFeaturesService} from "@shared/services/ai-features.service.ts";
import {PriceSuggestionService} from "@shared/services/price-suggestion.service.ts";
// Removed duplicate "import { finalize } from 'rxjs/operators';"

@Component({
    selector: 'app-product-form',
    templateUrl: './product-form.component.html',
    styleUrls: ['./product-form.component.scss'],
    providers: [
        {provide: DateAdapter, useClass: AppDateAdapter},
        {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
    ],
    animations: egretAnimations
})
export class ProductFormComponent implements OnInit, OnDestroy {
    public getItemSub: Subscription[] = [];
    provider_search = new FormControl(false);
    new_state = new FormControl(false);
    filteredProviders: IProvider[] = [];
    loading = false;
    loadingProviders = false;
    _product: IProduct;
    productStates: IProductState[] = [];
    store: IStore = new Store();
    public itemForm: FormGroup = new FormGroup({});
    categories: ICategory[] = [];
    public photoGallery: GalleryImage[] = [];
    public imageSelected: GalleryImage | null = null;
    public defaultImage = 'assets/images/no-image.png';

    public detectedFeatures: string[] = [];
    public suggestedPrices: number[] = [];


    public previewImage: string | null = null;

    @Output() saved = new EventEmitter();
    @Output() cancel = new EventEmitter();

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

    constructor(
        private fb: FormBuilder,
        private confirmService: AppConfirmService,
        private errorService: AppErrorService,
        private productService: ProductService,
        private t: TranslateService,
        private snack: MatSnackBar,
        private productStateService: ProductStateService,
        private dialog: MatDialog,
        public jwtAuth: JwtAuthService,
        private providerService: ProviderService,
        private categoryService: CategoryService,
        private aiFeaturesService: AiFeaturesService,
        private priceSuggestionService: PriceSuggestionService
    ) {
    }

    ngOnInit() {
        this.store = this.jwtAuth.getStore();
        this.getItemSub.push(
            this.provider_search.valueChanges
                .pipe(
                    debounceTime(70),
                    tap(() => (this.loadingProviders = true)),
                    switchMap((value) =>
                        this.providerService.query({q: value}).pipe(finalize(() => (this.loadingProviders = true)))
                    )
                )
                .subscribe(
                    (result) => {
                        this.loadingProviders = false;
                        this.filteredProviders = result.body;
                    },
                    (error) => {
                        console.log('Error ', error);
                        this.loadingProviders = false;
                    }
                )
        );
        this.getData();
    }

    private getData() {
        this.getStates();
        this.getCategories();
    }

    private getStates() {
        this.getItemSub.push(
            this.productStateService.query().subscribe(
                (res: HttpResponse<IProductState[]>) => {
                    this.productStates = res.body || [];
                },
                (error) => {
                    console.log(error);
                }
            )
        );
    }

    private getCategories() {
        this.getItemSub.push(
            this.categoryService.query().subscribe(
                (res: HttpResponse<ICategory[]>) => {
                    this.categories = res.body || [];
                },
                (error) => {
                    console.log(error);
                }
            )
        );
    }

    buildForm(item: IProduct) {
        console.log(item);
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
            fee: [item.fee, [Validators.required]],
            note: [item.note]
        });
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
            fee: this.itemForm.get(['fee'])!.value,
            note: this.itemForm.get(['note'])!.value
        };
    }

    onProviderSelected = (item?: IProvider) => {
        this._product.provider = item;
        this._product.provider_id = item.id;
        this.itemForm.patchValue({
            provider_id: item.id,
            fee: item.fee
        });
        return item.name;
    };


    updateCost() {
        const price = this.itemForm.get('price').value;
        const fee = this.itemForm.get('fee').value;

        if (price && fee) {
            const feeDecimal = fee / 100;
            const cost = price * (1 - feeDecimal);
            this.itemForm.patchValue({
                cost: cost
            }, {emitEvent: false});
        }
    }


    public productStateCompare = function (option, value): boolean {
        return option.id === value.state_id;
    };

    cancelSelection(): void {
        this._product = new Product();
        this.cancel.emit();
    }

    saveProduct(): void {
        this.loading = true;
        this._product = this.createFromForm();
        if (this._product.id) {
            this.getItemSub.push(
                this.productService.update(this._product).subscribe(
                    (b) => {
                        this.loading = false;
                        this.snack.open('Producto guardado correctamente', 'OK', {duration: 4000});
                        this.saved.emit();
                    },
                    (error) => {
                        this.errorService.error(error);
                        this.snack.open('Ocurrio un error, intente mas tarde', 'OK', {duration: 4000});
                        this.loading = false;
                    }
                )
            );
        } else {
            this.getItemSub.push(
                this.productService.create(this._product).subscribe(
                    (b) => {
                        this.loading = false;
                        this.snack.open('Producto guardado correctamente', 'OK', {duration: 4000});
                        this.saved.emit();
                    },
                    (error) => {
                        this.errorService.error(error);
                        this.snack.open('Ocurrio un error, intente mas tarde', 'OK', {duration: 4000});
                        this.loading = false;
                    }
                )
            );
        }
    }

    deleteProduct() {
        this.confirmService
            .confirm({title: this.t.instant('confirm.delete'), message: this.t.instant('delete.confirmation.message')})
            .subscribe((res) => {
                this.loading = true;
                if (res) {
                    this.getItemSub.push(
                        this.productService.delete(this._product.id).subscribe(
                            (value1) => {
                                this.loading = false;
                                this.saved.emit();
                            },
                            (error) => {
                                this.loading = false;
                                this.errorService.error(error);
                                this.snack.open('Ocurrio un error, intente mas tarde', 'OK', {duration: 4000});
                            }
                        )
                    );
                } else {
                    this.loading = false;
                }
            });
    }

    public componentMethod(event) {
        event.target.select();
    }

    private addProvider(data: {}, isNew: boolean) {
        const title = (isNew ? this.t.instant('new') : this.t.instant('update')) + '  ' + this.t.instant('provider');
        const dialogRef = this.dialog.open(ProviderPopupComponent, {
            width: '850px',
            disableClose: true,
            data: {title: title, item: data}
        });
        dialogRef.afterClosed().subscribe((res) => {
            if (!res) {
                return;
            } else {
                this._product.provider_id = res;
            }
        });
    }

    changeState(photo: GalleryImage) {
        if (photo.state === '1') {
            return;
        }
        this.imageSelected = photo;
        this.photoGallery = this.photoGallery.map(p => ({
            ...p,
            state: p.id === photo.id ? '1' : '0'
        }));
    }


    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const file = input.files[0];
            const reader = new FileReader();
            reader.onload = (e: any) => {
                const newImage: GalleryImage = {
                    url: e.target.result,
                    state: this.photoGallery.length === 0 ? '1' : '0',
                    id: Date.now() // Identificador único temporal
                };
                this.photoGallery.push(newImage);
                this.imageSelected = this.imageSelected ?? newImage;
            };
            reader.readAsDataURL(file);
        }
    }

    removeImage(image: GalleryImage) {
        const index = this.photoGallery.findIndex(img => img.id === image.id);
        if (index > -1) {
            this.photoGallery.splice(index, 1);
            // Si eliminamos la imagen activa, activamos la primera disponible
            if (image.state === '1' && this.photoGallery.length > 0) {
                this.photoGallery[0].state = '1';
            }
        }
    }

    // Method 1: base64ToFile
    private base64ToFile(dataurl: string, filename: string): File | null {
      try {
        const arr = dataurl.split(',');
        if (arr.length < 2) { return null; }
        const mimeMatch = arr[0].match(/:(.*?);/);
        if (!mimeMatch || mimeMatch.length < 2) { return null; }
        const mime = mimeMatch[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
      } catch (e) {
        console.error('Error converting base64 to File:', e);
        this.snack.open(this.t.instant('notifications.base64_conversion_error'), 'OK', { duration: 3000 });
        return null;
      }
    }

    // Method 2: detectFeatures
    public detectFeatures(): void {
      const selectedImage = this.photoGallery.find(p => p.state === '1');
      if (!selectedImage || !selectedImage.url) {
        this.snack.open(this.t.instant('notifications.select_image_first'), 'OK', { duration: 3000 });
        return;
      }

      const imageFile = this.base64ToFile(selectedImage.url, 'product_image.png');
      if (!imageFile) {
        this.snack.open(this.t.instant('notifications.image_process_error'), 'OK', { duration: 3000 });
        return;
      }

      this.loading = true;
      this.getItemSub.push(
        this.aiFeaturesService.detectFeatures(imageFile).pipe(
          finalize(() => this.loading = false)
        ).subscribe(
          (features) => {
            this.detectedFeatures = features;
            this.snack.open(this.t.instant('notifications.features_detected_success'), 'OK', { duration: 3000 });
          },
          (error) => {
            console.error('Error detecting features:', error);
            this.snack.open(this.t.instant('notifications.features_detected_error'), 'OK', { duration: 3000 });
          }
        )
      );
    }

    // Method 3: searchPriceSuggestions
    public searchPriceSuggestions(): void {
      const categoryId = this.itemForm.get('category_id')?.value;
      const category = this.categories.find(cat => cat.id === categoryId);

      const selectedImage = this.photoGallery.find(p => p.state === '1');
      let imageFile: File | null = null;
      if (selectedImage && selectedImage.url) {
        imageFile = this.base64ToFile(selectedImage.url, 'product_image_price_search.png');
        if (!imageFile) {
          this.snack.open(this.t.instant('notifications.image_process_error_price_suggestion_optional'), 'OK', { duration: 3000 });
        }
      }

      this.loading = true;
      this.getItemSub.push(
        this.priceSuggestionService.getPriceSuggestions({
          category: category?.name,
          photo: imageFile ?? undefined,
          brand: undefined,
          year: undefined
        }).pipe(
          finalize(() => this.loading = false)
        ).subscribe(
          (prices) => {
            this.suggestedPrices = prices;
            this.snack.open(this.t.instant('notifications.prices_suggested_success'), 'OK', { duration: 3000 });
          },
          (error) => {
            console.error('Error loading price suggestions:', error);
            this.snack.open(this.t.instant('notifications.prices_suggested_error'), 'OK', { duration: 3000 });
          }
        )
      );
    }

    ngOnDestroy() {
        this.getItemSub.forEach((sub) => sub.unsubscribe());
        this.getItemSub = [];
    }
}
