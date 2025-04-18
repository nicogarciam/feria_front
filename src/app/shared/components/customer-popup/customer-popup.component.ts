import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import {FileItem, ParsedResponseHeaders} from 'ng2-file-upload';
import {egretAnimations} from "@animations/egret-animations";
import {ImageService} from '@services/image.service';
import {AppLoaderService} from '@services/app-loader/app-loader.service';
import {Observable} from 'rxjs';
import {HttpResponse} from '@angular/common/http';
import {TranslateService} from '@ngx-translate/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {APP_DATE_FORMATS, AppDateAdapter} from '@helpers/format-datepicker';
import {debounceTime, finalize, switchMap, tap} from 'rxjs/operators';
import {ICustomer} from "@models/customer.model";
import {CustomerService} from "@services/entities/customer.service";
import {IProvider, Provider} from "@models/provider.model";

@Component({
    selector: 'app-customer-popup',
    templateUrl: './customer-popup.component.html',
    styleUrls: ['./customer-popup.component.scss'],
    providers: [
        {provide: DateAdapter, useClass: AppDateAdapter},
        {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS},
        {provide: MAT_DATE_LOCALE, useValue: 'es'},
    ],
    animations: egretAnimations
})

export class CustomerPopupComponent implements OnInit {
    public itemForm: FormGroup;

    _customer: ICustomer;

    _fileToUpload: FileItem;
    isLoading = false;

    selectedImage = null;
    imageError: string;

    search = false;

    public filteredItems: IProvider[] = [];

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: { title: string, item: ICustomer },
        public dialogRef: MatDialogRef<CustomerPopupComponent>,
        private fb: FormBuilder, private customerService: CustomerService,
        private t: TranslateService, private snack: MatSnackBar,
        public imageService: ImageService, private loader: AppLoaderService
    ) {

    }

    ngOnInit() {
        this._customer = this.data.item;
        this.buildItemForm(this._customer);

        this.imageService.uploader.onAfterAddingFile = this.afterAddingImage;
        this.imageService.uploader.onErrorItem = (item, response, status, headers) =>
            this.onErrorItem(item, response, status, headers);
        this.imageService.uploader.onSuccessItem = (item, response, status, headers) =>
            this.onSuccessItem(item, response, status, headers);

    }

    afterAddingImage = (file) => {
        this._fileToUpload = file;
        file.withCredentials = false;
    }


    selectCustomer($event: FocusEvent) {
        const n = this.itemForm.get('name').value
        if (this._customer && this._customer.name !== n && this.itemForm.get('id')!.value) {
            this.itemForm.patchValue({
                id: null,
                phone: '',
                email: '',
                address: ''
            })
        }
    }

    selectCustomerFn = (item?: ICustomer): string | undefined => {
        if (item) {
            this._customer = item;
            this.itemForm.patchValue({
                id: item.id,
                email: item?.email,
                city_id: item.city_id,
                phone: item?.phone,
                address: item.address
            });
            return item.name;
        } else {
            if (this.itemForm.get('id')!.value) {
                return this.itemForm.get('name')!.value + ' - '
                    + this.itemForm.get('email')!.value;
            }
            return undefined;
        }
    }


    onSuccessItem(item: FileItem, response: string, status: number, headers: ParsedResponseHeaders): any {

        const data = JSON.parse(response); // success server response
        setTimeout(() => {
            this.imageService.uploader.queue = [];
            this._customer.photo = data.src;
            this.itemForm.patchValue({'photo': this._customer.photo})

        }, 290)
    }

    onErrorItem(item: FileItem, response: string, status: number, headers: ParsedResponseHeaders): any {
        const error = JSON.parse(response); // error server response
        console.log(error);
    }

    buildItemForm(item: ICustomer) {

        this.itemForm = this.fb.group({
            id: item.id,
            name: [item?.name, Validators.required],
            email: [item?.email, [Validators.required, Validators.email]],
            city_id: item.city_id,
            customer_search: new FormControl(''),
            phone: item?.phone,
            address: item.address

        });

        this.itemForm.get('name').valueChanges
            .pipe(
                debounceTime(100),
                tap(() => this.isLoading = true),
                switchMap(value => this.customerService.query({q: value})
                    .pipe(
                        finalize(() => this.isLoading = false),
                    )
                )
            ).subscribe(
            (result: HttpResponse<IProvider[]>) => {
                this.filteredItems = result.body;
            } ,
            (error) => console.log('Error ', error),
        );
    }

    compareFn(o1: any, o2: any) {
        return o1 && o2 ? (o1.id === o2.id) : false;
    }


    submit() {
        this.isLoading = true;
        if (this.itemForm.valid) {
            this.save(this.createFromForm());
        }
    }

    private createFromForm(): ICustomer {
        return {
            ...new Provider(),
            name: this.itemForm.get(['name'])!.value,
            email: this.itemForm.get(['email'])!.value,
            city_id: this.itemForm.get(['city_id'])!.value,
            id: this.itemForm.get(['id'])!.value,
            phone: this.itemForm.get(['phone'])!.value,
        };
    }

    close() {
        this.dialogRef.close();
    }

    save(item): void {
        if (item.id) {
            this.subscribeToSaveResponse(this.customerService.update(item));
        } else {
            this.subscribeToSaveResponse(this.customerService.create(item));
        }
    }


    protected subscribeToSaveResponse(result: Observable<HttpResponse<ICustomer>>): void {
        result.subscribe(
            (res) => this.onSaveSuccess(res.body),
            (error) => {
                this.isLoading = false;
                this.onSaveError(error.error)
            }
        );
    }

    protected onSaveSuccess(res: ICustomer): void {
        this.isLoading = false;
        this.loader.close();
        this.dialogRef.close(res);
        this.snack.open(this.t.instant('saved.success'), 'OK', {duration: 4000})
    }

    protected onSaveError(error): void {
        this.isLoading = false;
        this.loader.close();
        this.snack.open('Error: ' + error.message, 'Ups!', {duration: 4000})
    }

    public componentMethod( event ) { event.target.select(); }


}
