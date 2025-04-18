import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {DateAdapter, MAT_DATE_FORMATS} from '@angular/material/core';
import {APP_DATE_FORMATS, AppDateAdapter} from '@helpers/format-datepicker';
import {Category, ICategory} from "@models/category.model";
import {HttpResponse} from "@angular/common/http";
import {CategoryService} from "@services/entities/category.service";
import {Observable, Subscription} from "rxjs";
import {AppConfirmService} from "@services/app-confirm/app-confirm.service";
import {TranslateService} from "@ngx-translate/core";
import {AppLoaderService} from "@services/app-loader/app-loader.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {JwtAuthService} from "@services/auth/jwt-auth.service";
import {IStore} from "@models/store.model";
import {SortType} from "@swimlane/ngx-datatable";
import {AppErrorService} from "@services/app-error/app-error.service";

@Component({
    selector: 'app-category-table-popup',
    templateUrl: './category-popup.component.html',
    styleUrls: ['./category-popup.component.css'],
    providers: [
        {provide: DateAdapter, useClass: AppDateAdapter},
        {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
    ]
})
export class CategoryPopupComponent implements OnInit, OnDestroy {
    public itemForm: FormGroup;

    sortType = SortType;

    public items: ICategory[];
    public getItemSub: Subscription;
    private store: IStore;
    public itemSelected: ICategory;
    subscriptions: Subscription[] = [];
    color = '#2883e9';


    constructor(
        @Inject(MAT_DIALOG_DATA) public data: {title: string, item: ICategory} ,
        public dialogRef: MatDialogRef<CategoryPopupComponent>, private confirmService: AppConfirmService,
        private fb: FormBuilder, private accommodationTypeService: CategoryService,
        private loader: AppLoaderService, private t: TranslateService, private snack: MatSnackBar,
        private jwtAuth: JwtAuthService, private error: AppErrorService
    ) {
    }

    ngOnInit() {
        // console.log('ngOnInit' , this.data);
        this.store = this.jwtAuth.store$.value;
        this.getItems()
        this.itemSelected = this.data.item || new Category();
        this.buildItemForm(this.data.item)
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => {
            sub.unsubscribe();
        })
        this.subscriptions = [];

        if (this.getItemSub) {
            this.getItemSub.unsubscribe()
        }
    }


    getItems() {
        this.subscriptions.push(this.accommodationTypeService.findByStore(this.store?.id)
            .subscribe((res: HttpResponse<ICategory[]>) => {
                    (this.items = res.body || [])
                },
                (error) => this.error.error(error)
            ));
    }

    buildItemForm(accommodationType: ICategory) {
        this.itemForm = this.fb.group({
            id: accommodationType.id,
            name: [accommodationType.name, [Validators.required]],
            color: accommodationType.color,
        })
    }

    submit() {
        this.saveAccommodationType()
        // this.dialogRef.close(this.createFromForm())
    }

    private createFromForm(): ICategory {
        return {
            ...new Category(),
            id: this.itemForm.get(['id'])!.value,
            name: this.itemForm.get(['name'])!.value,
            color: this.itemForm.get(['color'])!.value,
            store_id: this.store?.id
        };
    }


    deleteItem(row) {
        const message = this.t.instant('delete') + ' ' + row.name + ' ?'
        this.confirmService.confirm({title: this.t.instant('are.you.sure'), message: message})
            .subscribe(res => {
                if (res) {
                    this.loader.open();
                    this.subscriptions.push(this.accommodationTypeService.delete(row.id)
                        .subscribe(list => {
                                this.getItems();
                                this.loader.close();
                                this.snack.open(this.t.instant('deleted'), 'OK', {duration: 4000})
                            },
                            (error => {
                                this.error.error(error);
                                this.loader.close();
                                this.snack.open(this.t.instant('error'), 'Ups!', {duration: 4000})
                            })))
                }
            })
    }

    edit(row: any) {
        this.itemForm.patchValue(row);
    }

    private saveAccommodationType() {
        this.save(this.createFromForm());
    }


    save(item): void {
        console.log(item);
        if (item.id) {
            this.subscribeToSaveResponse(this.accommodationTypeService.update(item));
        } else {
            this.subscribeToSaveResponse(this.accommodationTypeService.create(item));
        }
    }

    protected subscribeToSaveResponse(result: Observable<HttpResponse<ICategory>>): void {
        this.subscriptions.push(result.subscribe(
            (res) => this.onSaveSuccess(),
            (error) => this.onSaveError(error.error)
        ));
    }

    protected onSaveSuccess(): void {
        this.getItems();
        this.clearForm();
        this.loader.close();
        this.snack.open(this.t.instant('saved.success'), 'OK', {duration: 4000})
    }

    protected onSaveError(error): void {
        this.loader.close();
        console.log(error);
        this.error.error(error);
        this.snack.open('Error: ' + error.message, 'Ups!', {duration: 4000})
    }

    private clearForm() {
        this.itemForm.patchValue({
            id: '',
            name: '',
            color: '',
            capacity_desc: '',
            max_capacity: ''
        })
    }
}
