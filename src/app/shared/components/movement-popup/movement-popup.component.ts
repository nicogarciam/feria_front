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
import {IProvider, Provider} from "@models/provider.model";
import {ProviderService} from "@services/entities/provider.service";
import {IMovement, Movement} from "../../models/movement.model";
import {MovementsService} from "@services/entities/movements.service";

@Component({
    selector: 'app-movement-popup',
    templateUrl: './movement-popup.component.html',
    styleUrls: ['./movement-popup.component.scss'],
    providers: [
        {provide: DateAdapter, useClass: AppDateAdapter},
        {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS},
        {provide: MAT_DATE_LOCALE, useValue: 'es'},
    ],
    animations: egretAnimations
})

export class MovementPopupComponent implements OnInit {
    public itemForm: FormGroup;

    _movement: IMovement;

    _fileToUpload: FileItem;
    isLoading = false;

    selectedImage = null;
    imageError: string;

    search = false;

    public filteredItems: IProvider[] = [];

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: { title: string, item: IMovement },
        public dialogRef: MatDialogRef<MovementPopupComponent>,
        private fb: FormBuilder, private providerService: ProviderService,
        private t: TranslateService, private snack: MatSnackBar,
        private movementsService: MovementsService, private loader: AppLoaderService
    ) {

    }

    ngOnInit() {
        this._movement = this.data.item;
        this.buildItemForm(this._movement);

    }

    onErrorItem(item: FileItem, response: string, status: number, headers: ParsedResponseHeaders): any {
        const error = JSON.parse(response); // error server response
        console.log(error);
    }

    buildItemForm(item: IMovement) {
        console.log("item", item);
        this.itemForm = this.fb.group({
            id: item.id,
            amount: ['', [Validators.required]],
            concept: ['', [Validators.required]],
            date: [new Date(), [Validators.required]],
            type: ['DEBIT', [Validators.required]],
            provider_id: item?.provider_id,
            customer_id: item?.customer_id,
            store_id: item?.store_id,
        });


    }

    onCancel(): void {
        this.dialogRef.close();
    }

    submit() {
        this.isLoading = true;
        if (this.itemForm.valid) {
            this.save(this.createFromForm());
        }
    }

    private createFromForm(): IMovement {
        return {
            ...new Movement(),
            id: this.itemForm.get(['id'])!.value,
            amount: this.itemForm.get(['amount'])!.value,
            concept: this.itemForm.get(['concept'])!.value,
            date: this.itemForm.get(['date'])!.value,
            type: this.itemForm.get(['type'])!.value,
            provider_id: this._movement.provider.id,
            customer_id: this.itemForm.get(['customer_id'])!.value,
            store_id: this.itemForm.get(['store_id'])!.value,
        };
    }

    close() {
        this.dialogRef.close();
    }

    save(item): void {
        if (item.id) {
            this.subscribeToSaveResponse(this.movementsService.update(item));
        } else {
            this.subscribeToSaveResponse(this.movementsService.create(item));
        }
    }


    protected subscribeToSaveResponse(result: Observable<HttpResponse<IProvider>>): void {
        result.subscribe(
            (res) => this.onSaveSuccess(res.body),
            (error) => this.onSaveError(error.error)
        );
    }

    protected onSaveSuccess(res: IProvider): void {
        this.isLoading = false;
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
