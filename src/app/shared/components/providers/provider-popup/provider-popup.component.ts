import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import {FileItem, ParsedResponseHeaders} from 'ng2-file-upload';
import {Observable} from 'rxjs';
import {HttpResponse} from '@angular/common/http';
import {TranslateService} from '@ngx-translate/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {debounceTime, finalize, switchMap, tap} from 'rxjs/operators';
import {APP_DATE_FORMATS, AppDateAdapter} from "@helpers/format-datepicker";
import {egretAnimations} from "@animations/egret-animations";
import {IProvider, Provider} from "@models/provider.model";
import {ProviderService} from "@services/entities/provider.service";
import {AppLoaderService} from "@services/app-loader/app-loader.service";
import {ImageService} from "@services/image.service";

@Component({
    selector: 'app-provider-popup',
    templateUrl: './provider-popup.component.html',
    styleUrls: ['./provider-popup.component.scss'],
    providers: [
        {provide: DateAdapter, useClass: AppDateAdapter},
        {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS},
        {provide: MAT_DATE_LOCALE, useValue: 'es'},
    ],
    animations: egretAnimations
})

export class ProviderPopupComponent implements OnInit {
    public itemForm: FormGroup;

    _provider: IProvider;

    _fileToUpload: FileItem;
    isLoading = false;

    selectedImage = null;
    imageError: string;

    search = false;

    public filteredItems: IProvider[] = [];

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: { title: string, item: IProvider },
        public dialogRef: MatDialogRef<ProviderPopupComponent>,
        private fb: FormBuilder, private providerService: ProviderService,
        private t: TranslateService, private snack: MatSnackBar,
        public imageService: ImageService, private loader: AppLoaderService
    ) {

    }

    ngOnInit() {
        this._provider = this.data.item;
        this.buildItemForm(this._provider);

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


    selectProvider($event: FocusEvent) {
        const n = this.itemForm.get('name').value
        if (this._provider && this._provider.name !== n && this.itemForm.get('id')!.value) {
            this.itemForm.patchValue({
                id: null,
                phone: '',
                email: '',
                address: '',
                cuil: '',
                contact_name: ''
            })
        }
    }

    selectProviderFn = (item?: IProvider): string | undefined => {
        if (item) {
            console.log("guest", item);
            this._provider = item;
            this.itemForm.patchValue({
                id: item.id,
                email: item?.email,
                cuil: item.cuil,
                city_id: item.city_id,
                phone: item?.phone,
                address: item.address
            });
            return item.name;
        } else {
            if (this.itemForm.get('id')!.value) {
                return this.itemForm.get('name')!.value + ' - '
                    + this.itemForm.get('email')!.value + '  cuil:  ' + this.itemForm.get('cuil')!.value;
            }
            return undefined;
        }
    }


    onSuccessItem(item: FileItem, response: string, status: number, headers: ParsedResponseHeaders): any {

        const data = JSON.parse(response); // success server response
        setTimeout(() => {
            this.imageService.uploader.queue = [];
            this._provider.photo = data.src;
            this.itemForm.patchValue({'photo': this._provider.photo})

        }, 290)
    }

    onErrorItem(item: FileItem, response: string, status: number, headers: ParsedResponseHeaders): any {
        const error = JSON.parse(response); // error server response
        console.log(error);
    }

    buildItemForm(item: IProvider) {

        this.itemForm = this.fb.group({
            id: item.id,
            name: [item?.name, Validators.required],
            email: [item?.email, [Validators.required, Validators.email]],
            cuil: item.cuil,
            city_id: item.city_id,
            customer_search: new FormControl(''),
            phone: item?.phone,
            address: item.address,
            contact_name: item.contact_name

        });

        this.itemForm.get('name').valueChanges
            .pipe(
                debounceTime(100),
                tap(() => this.isLoading = true),
                switchMap(value => this.providerService.query({q: value})
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
        if (this.itemForm.valid) {
            this.save(this.createFromForm());
        }
    }

    private createFromForm(): IProvider {
        return {
            ...new Provider(),
            name: this.itemForm.get(['name'])!.value,
            email: this.itemForm.get(['email'])!.value,
            city_id: this.itemForm.get(['city_id'])!.value,
            id: this.itemForm.get(['id'])!.value,
            phone: this.itemForm.get(['phone'])!.value,
            contact_name: this.itemForm.get(['contact_name'])!.value
        };
    }

    close() {
        this.dialogRef.close();
    }

    save(item): void {
        if (item.id) {
            this.subscribeToSaveResponse(this.providerService.update(item));
        } else {
            this.subscribeToSaveResponse(this.providerService.create(item));
        }
    }


    protected subscribeToSaveResponse(result: Observable<HttpResponse<IProvider>>): void {
        result.subscribe(
            (res) => this.onSaveSuccess(res.body),
            (error) => this.onSaveError(error.error)
        );
    }

    protected onSaveSuccess(res: IProvider): void {
        this.loader.close();
        this.dialogRef.close(res);
        this.snack.open(this.t.instant('saved.success'), 'OK', {duration: 4000})
    }

    protected onSaveError(error): void {
        this.loader.close();
        this.snack.open('Error: ' + error.message, 'Ups!', {duration: 4000})
    }

    public componentMethod( event ) { event.target.select(); }


}
