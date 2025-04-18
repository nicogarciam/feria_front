import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FileUploader} from 'ng2-file-upload';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {CityService} from '@services/entities/city.service';
import {Observable} from 'rxjs';
import {HttpResponse} from '@angular/common/http';
import {AppLoaderService} from '@services/app-loader/app-loader.service';
import {TranslateService} from '@ngx-translate/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ICity} from '@models/city.model';
import {DateAdapter, MAT_DATE_FORMATS} from '@angular/material/core';
import {APP_DATE_FORMATS, AppDateAdapter} from '@helpers/format-datepicker';
import {CustomValidators} from 'ngx-custom-validators';
import {egretAnimations} from '@animations/egret-animations';
import {Customer, ICustomer} from "@models/customer.model";
import {CustomerService} from "@services/entities/customer.service";
import {AppErrorService} from "@services/app-error/app-error.service";

@Component({
    selector: 'app-customer-settings',
    templateUrl: './customer-settings.component.html',
    styleUrls: ['./customer-settings.component.css'],
    providers: [
        {provide: DateAdapter, useClass: AppDateAdapter},
        {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
    ],
    animations: egretAnimations
})
export class CustomerSettingsComponent implements OnInit {
    public uploader: FileUploader = new FileUploader({url: 'upload_url'});
    public hasBaseDropZoneOver = false;



    public itemForm: FormGroup;
    public changePassForm: FormGroup;
    public cities: ICity[] = [];
    _customer: ICustomer;
    @Output() customerChange = new EventEmitter();

    @Input()
    get customer(): ICustomer {
        return this._customer;
    }

    set customer(value: ICustomer) {
        if (value !== undefined) {
            this._customer = value;
            this.customerChange.emit(this._customer);
        }
    }




    constructor(private fb: FormBuilder, private customerService: CustomerService,
                private cityService: CityService, private loader: AppLoaderService,
                private translate: TranslateService, private snack: MatSnackBar,
                private error: AppErrorService) {
    }

    ngOnInit() {
        this.buildItemForm(this.customer);
        this.buildChangePassForm();
        this.cityService.query()
            .subscribe((res: HttpResponse<ICity[]>) =>
                    (this.cities = res.body || []),
                (error) => console.log(error)
            );
    }

    buildItemForm(customer: ICustomer) {

        this.itemForm = this.fb.group({
            id: customer?.id,
            name: [customer?.name, [Validators.required]],
            email: [customer?.email, [Validators.required]],
            phone: customer?.phone,
            address: customer?.address,
            city: {id: customer?.city_id},
        })
    }


    buildChangePassForm() {
        const new_password = new FormControl('', Validators.required);
        const confirm_Password = new FormControl('', CustomValidators.equalTo(new_password));

        this.changePassForm = this.fb.group({
            password:  ['', [Validators.required]],
            new_password:  new_password,
            confirm_password:  confirm_Password,
        })
    }


    public fileOverBase(e: any): void {
        this.hasBaseDropZoneOver = e;
    }

    submit() {
        this.loader.open();
        const data = this.createFromForm()
        this.save(data);
    }

    changePassword() {
        this.loader.open();
    }

    save(item): void {
        console.log(item);
        if (item.id) {
            this.subscribeToSaveResponse(this.customerService.update(item));
        }
    }

    protected subscribeToSaveResponse(result: Observable<HttpResponse<ICustomer>>): void {
        result.subscribe(
            (res) => {
                this.customer = res.body;
                this.onSaveSuccess();
                },
            (error) => this.onSaveError(error.error)
        );
    }

    protected onSaveSuccess(): void {
        this.loader.close();
        this.snack.open(this.translate.instant('saved.success'), 'OK', {duration: 4000})
    }

    protected onSaveError(error): void {
        this.loader.close();
        this.error.error(error);
        this.snack.open('Error: ' + error.message, 'Ups!', {duration: 4000})
    }

    private createFromForm(): ICustomer {
        return new Customer({
                id: this.itemForm.get(['id'])?.value,
                name: this.itemForm.get(['name'])?.value,
                contact_name: this.itemForm.get(['contact_name'])?.value,
                email: this.itemForm.get(['email'])?.value,
                cuil: this.itemForm.get(['cuil'])?.value,
                phone: this.itemForm.get(['phone'])?.value,
                address: this.itemForm.get(['address'])?.value,
                city_id: this.itemForm.get(['city_id'])?.value,

            }
        )
    }

    compareFn(o1: any, o2: any) {
        return o1 != null && o2 != null ? (o1.id === o2.id) : false;
    }
}
