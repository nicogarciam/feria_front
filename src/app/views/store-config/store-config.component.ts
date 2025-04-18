import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {JwtAuthService} from '@services/auth/jwt-auth.service';
import {User} from '@models/user.model';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {Store, IStore} from '@models/store.model';
import {StoreService} from '@services/entities/store.service';
import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import {AppLoaderService} from '@services/app-loader/app-loader.service';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {TranslateService} from '@ngx-translate/core';
import {ICity} from "@models/city.model";
import {IAccount} from "@models/account.model";
import {CityService} from "@services/entities/city.service";
import {MatTabChangeEvent} from "@angular/material/tabs";

@Component({
    selector: 'app-store-config',
    templateUrl: './store-config.component.html',
    styleUrls: ['./store-config.component.css']
})
export class StoreConfigComponent implements OnInit, OnDestroy {
    user: Observable<User>;
    store: IStore = new Store();
    stores: IStore[] = [];

    selectedImage = null;
    imageError: string;
    registered = true;

    subscriptions: Subscription[] = [];

    constructor(private router: ActivatedRoute, public jwtAuth: JwtAuthService,
                public storeService: StoreService, private loader: AppLoaderService,
                private dialog: MatDialog, private snack: MatSnackBar, private routeActive: ActivatedRoute,
                private t: TranslateService, private cityService: CityService) {
    }

    ngOnInit() {
        this.user = this.jwtAuth.user$;
        this.store.logo = "assets/images/no_image.png";
        this.store = this.jwtAuth.getStore();


        this.subscriptions.push(this.jwtAuth.store$.subscribe(value => {
                if (value) {
                    this.store = value
                }
            })
        );


        if (this.store?.id) {
            this.subscriptions.push(this.storeService.find(this.store.id).subscribe(st => {
                        this.jwtAuth.setStore(st.body);
                    },
                    error => console.log("Error storeService.find"))
            )
        }

    }


    protected subscribeToSaveResponse(result: Observable<HttpResponse<IStore>>): void {
        this.subscriptions.push(
            result.subscribe(
                (res) => this.onSaveSuccess(),
                (error) => this.onSaveError(error.error)
            ));
    }

    protected onSaveSuccess(): void {
        // this.getEntity();
        this.jwtAuth.setStore(this.store);
        this.loader.close();
        this.snack.open(this.t.instant('saved.success'), 'OK', {duration: 4000})
    }

    protected onSaveError(error): void {
        this.loader.close();
        this.snack.open('Error: ' + error.message, 'Ups!', {duration: 4000})
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
                        this.imageError = 'Maximum dimentions allowed ' + max_height + '*' + max_width + 'px';
                        fileInput.target.value = null;
                        return false;
                    } else {
                        this.selectedImage = fileInput.target.files[0];
                        fileInput.target.value = null;
                        this.updateLogo();
                    }
                };
            };

            reader.readAsDataURL(fileInput.target.files[0]);
        }
    }

    updateLogo() {
        const formData = new FormData();
        formData.append('logo', this.selectedImage, this.selectedImage.name);
        formData.append('store_id', this.store.id.toString());

        this.storeService.updateLogo(formData).subscribe(
            (res) => {
                this.store = res.body;
                this.onSaveSuccess();
            },
            (error) =>
                this.onSaveError(error.error)
        )
    }

    updateStore(store: IStore) {
        this.subscriptions.push(this.storeService.update(this.store).subscribe(
            (res) => {
                this.store = res.body;
                this.jwtAuth.setStore(this.store);
                this.onSaveSuccess();
            },
            (error) => this.onSaveError(error.error)
        ));
    }

    createStore(store: IStore) {
        store.owner = this.jwtAuth.getUser();
        store.owner_id = store.owner.id;
        this.subscriptions.push(this.storeService.create(store).subscribe(
            (res) => {
                this.store = res.body;
                this.jwtAuth.setStore(this.store);
                this.onSaveSuccess();
            },
            (error) => this.onSaveError(error.error)
        ));
    }

    saveData(store: IStore) {
        if (store.id) {
            this.updateStore(store);
        } else {
            this.createStore(store);
        }
    }


    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => {
            sub.unsubscribe();
        })
        this.subscriptions = [];
    }
}
