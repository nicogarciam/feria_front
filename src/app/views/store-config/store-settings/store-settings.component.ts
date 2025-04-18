import {AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {HttpResponse} from '@angular/common/http';
import {ICity} from '@models/city.model';
import {CityService} from '@services/entities/city.service';
import {AppLoaderService} from '@services/app-loader/app-loader.service';
import {BehaviorSubject, Subscription} from 'rxjs';
import {JwtAuthService} from "@services/auth/jwt-auth.service";
import {ActivatedRoute, Router} from "@angular/router";
import {NavigationService} from "@services/navigation.service";
import {MatTabChangeEvent} from "@angular/material/tabs";
import {IStore, Store} from "@models/store.model";
import {IAccount} from "@models/account.model";

@Component({
    selector: 'app-store-settings',
    templateUrl: './store-settings.component.html',
    styleUrls: ['./store-settings.component.css']
})
export class StoreSettingsComponent implements OnInit, OnDestroy, AfterViewInit {
    public itemForm: FormGroup;
    private _store = new BehaviorSubject<IStore>(null);
    public cities: ICity[] = [];
    tab: string;
    tabIndex = 0;
    tabs = {
        settings: 0,
        accommodations: 1,
        prices: 2,
        discounts: 3,
        banks: 4,
        preferences: 5
    }

    subscriptions: Subscription[] = [];
    _account: IAccount;
    @Output() accountChange = new EventEmitter();

    @Output() saved: EventEmitter<IStore> = new EventEmitter<IStore>();
    @ViewChild('tabGroup') tabGroup;

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
    @Input()
    set store(store: IStore) {
        if (store) {
            this._store.next(store);
        } else {
            this._store.next(new Store());
        }
    };

    get store(): IStore { return this._store.getValue(); };

    constructor(private fb: FormBuilder, private cityService: CityService,
                private navService: NavigationService,
                private loader: AppLoaderService, private jwtAuth: JwtAuthService, private route: Router,
                private routeActive: ActivatedRoute) {
    }

    ngOnInit() {
        this.subscriptions.push(this._store
            .subscribe(x => {
                    this.buildItemForm(x);
            }));

        this.subscriptions.push(this.cityService.query()
            .subscribe((res: HttpResponse<ICity[]>) =>
                    (this.cities = res.body || []),
                (error) => console.log(error)
            ));


    }

    ngAfterViewInit() {
        console.log(this.tabGroup.selectedIndex);
        this.tab = this.routeActive.snapshot.params.tab;
        this.tabIndex = this.tabs[this.tab] || 0;
    }

    public tabChanged(tabChangeEvent: MatTabChangeEvent): void {
        console.log(tabChangeEvent);
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => {
            sub.unsubscribe();
        })
        this.subscriptions = [];
    }

    submit() {
        console.log('submit');
        this.loader.open();
        this.createFromForm();
        this.saved.emit(this.store);
    }


    buildItemForm(sto: IStore) {
        this.itemForm = this.fb.group({
            id: sto.id,
            state: sto.state,
            name: [sto.name, Validators.required],
            email: [sto.email, [Validators.required, Validators.email]],
            address: sto.address,
            instagram: sto.instagram,
            facebook: sto.facebook,
            description: sto.description,
            phone: sto.phone,
            city: {id: sto.city_id}
        });
    }

    private createFromForm(): IStore {
        this.store.phone = this.itemForm.get(['phone'])!.value;
        this.store.name = this.itemForm.get(['name'])!.value;
        this.store.email = this.itemForm.get(['email'])!.value;
        this.store.address = this.itemForm.get(['address'])!.value;
        this.store.instagram = this.itemForm.get(['instagram'])!.value;
        this.store.facebook = this.itemForm.get(['facebook'])!.value;
        this.store.description = this.itemForm.get(['description'])!.value;
        this.store.city_id = this.itemForm.get(['city'])!.value?.id;
        this.store.city = this.itemForm.get(['city'])!.value;
        return this.store;
    }

    compareFn(o1: any, o2: any) {
        return o1 != null && o2 != null ? (o1.id === o2.id) : false;
    }

}
