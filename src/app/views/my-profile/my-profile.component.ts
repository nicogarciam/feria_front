import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {IAccount} from '@models/account.model';
import {AccountService} from '@services/entities/account.service';
import {HttpResponse} from '@angular/common/http';
import {AppLoaderService} from '@services/app-loader/app-loader.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {TranslateService} from '@ngx-translate/core';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {egretAnimations} from '@animations/egret-animations';
import {JwtAuthService} from '@services/auth/jwt-auth.service';

@Component({
    selector: 'app-profile',
    templateUrl: './my-profile.component.html',
    styleUrls: ['./my-profile.component.css'],
    animations: egretAnimations
})
export class MyProfileComponent implements OnInit, OnDestroy {
    activeView = 'overview';

    accountObs = new BehaviorSubject<IAccount>({});
    account: IAccount;

    selectedImage = null;
    imageError: string;

    overviewOn = true;
    settingsOn = false;
    firstLogin = false;
    subscriptions: Subscription[] = [];

    constructor(private router: ActivatedRoute,
                private accountService: AccountService, private loader: AppLoaderService,
                private snack: MatSnackBar, private translate: TranslateService,
                public jwtAuth: JwtAuthService) {
    }

    ngOnInit() {
        this.subscriptions.push(this.accountObs.subscribe(value => {
            this.account = value;
        }));

        this.subscriptions.push(this.accountService.myAccount()
            .subscribe((res: HttpResponse<IAccount>) =>
                    (this.accountObs.next(res.body)),
                (error) => console.log(error)
            ));
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => {
            sub.unsubscribe();
        })
        this.subscriptions = [];
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
                        this.imageError =
                            'Maximum dimentions allowed ' +
                            max_height +
                            '*' +
                            max_width +
                            'px';
                        return false;
                    } else {

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
        formData.append('account_id', this.account.id.toString());

        this.subscriptions.push(this.accountService.updateImage(formData).subscribe(
            (res) => {
                this.account = res.body;

                this.onSaveSuccess();
            },
            (error) => this.onSaveError(error.error)));
    }


    protected onSaveSuccess(): void {
        this.loader.close();
        this.snack.open(this.translate.instant('saved.success'), 'OK', {duration: 4000})
    }

    protected onSaveError(error): void {
        this.loader.close();
        this.snack.open('Error: ' + error.message, 'Ups!', {duration: 4000})
    }


    gotoOverview() {
        this.overviewOn = true;
        this.settingsOn = false;
    }

    gotoSettings() {
        this.overviewOn = false;
        this.settingsOn = true;
    }
}
