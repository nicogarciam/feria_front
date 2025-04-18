import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';
import {FileUploader} from 'ng2-file-upload';
import {Account, IAccount} from '@models/account.model';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {AccountService} from '@services/entities/account.service';
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

@Component({
    selector: 'app-my-profile-settings',
    templateUrl: './my-profile-settings.component.html',
    styleUrls: ['./my-profile-settings.component.css'],
    providers: [
        {provide: DateAdapter, useClass: AppDateAdapter},
        {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
    ],
    animations: egretAnimations
})
export class MyProfileSettingsComponent implements OnInit {
    public uploader: FileUploader = new FileUploader({url: 'upload_url'});
    public hasBaseDropZoneOver = false;



    public itemForm: FormGroup;
    public changePassForm: FormGroup;
    public cities: ICity[] = [];
    _account: IAccount;
    @Output() accountChange = new EventEmitter();

    @Input()
    get account(): IAccount {
        return this._account;
    }

    set account(value: IAccount) {
        if (value !== undefined) {
            this._account = value;
            this.accountChange.emit(this._account);
        }
    }




    constructor(private fb: FormBuilder, private accountService: AccountService,
                private cityService: CityService, private loader: AppLoaderService,
                private translate: TranslateService, private snack: MatSnackBar) {
    }

    ngOnInit() {
        this.buildItemForm(this.account);
        this.buildChangePassForm();
        this.cityService.query()
            .subscribe((res: HttpResponse<ICity[]>) =>
                    (this.cities = res.body || []),
                (error) => console.log(error)
            );
    }

    buildItemForm(account: IAccount) {

        this.itemForm = this.fb.group({
            id: account?.id,
            firstName: [account?.first_name, [Validators.required]],
            lastName: [account?.last_name, [Validators.required]],
            email: [account?.email, [Validators.required]],
            langKey: account?.langKey,
            gender: account?.gender,
            phone: account?.phone,
            address: account?.address,
            dni: account?.dni,
            birthday:  [account?.birthday?.toDate(), [Validators.required]],
            city: {id: account?.city_id},


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
        console.log(data)
        this.save(data);
    }

    changePassword() {
        this.loader.open();
        // this.save(this.createFromForm());
    }

    save(item): void {
        console.log(item);
        if (item.id) {
            this.subscribeToSaveResponse(this.accountService.update(item));
        }
    }

    protected subscribeToSaveResponse(result: Observable<HttpResponse<IAccount>>): void {
        result.subscribe(
            (res) => {
                this.account = res.body;
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
        this.snack.open('Error: ' + error.message, 'Ups!', {duration: 4000})
    }

    private createFromForm(): IAccount {
        return new Account({
                id: this.itemForm.get(['id'])?.value,
                firstName: this.itemForm.get(['firstName'])?.value,
                lastName: this.itemForm.get(['lastName'])?.value,
                email: this.itemForm.get(['email'])?.value,
                langKey: this.itemForm.get(['langKey'])?.value,
                gender: this.itemForm.get(['gender'])?.value,
                phone: this.itemForm.get(['phone'])?.value,
                address: this.itemForm.get(['address'])?.value,
                dni: this.itemForm.get(['dni'])?.value,
                birthday: this.itemForm.get(['birthday'])?.value,
                city_id: this.itemForm.get(['city'])!.value?.id,
            }
        )
    }

    compareFn(o1: any, o2: any) {
        return o1 != null && o2 != null ? (o1.id === o2.id) : false;
    }
}
