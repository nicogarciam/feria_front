import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {HttpResponse} from '@angular/common/http';
import {MatSnackBar} from '@angular/material/snack-bar';
import {TranslateService} from '@ngx-translate/core';
import {BehaviorSubject, Subscription} from 'rxjs';
import {egretAnimations} from "@animations/egret-animations";
import {IAccount} from "@models/account.model";
import {AppLoaderService} from "@services/app-loader/app-loader.service";
import {JwtAuthService} from "@services/auth/jwt-auth.service";
import {AccountService} from "@services/entities/account.service";

@Component({
    selector: 'app-product',
    templateUrl: './product.component.html',
    styleUrls: ['./product.component.css'],
    animations: egretAnimations
})
export class ProductComponent implements OnInit, OnDestroy {
    activeView = 'overview';

    accountObs = new BehaviorSubject<IAccount>({});
    account: IAccount;

    imageError: string;

    overviewOn = true;
    settingsOn = false;

    subscriptions: Subscription[] = [];


    constructor(private router: ActivatedRoute, private accountService: AccountService,
                private loader: AppLoaderService,
                private snack: MatSnackBar, private t: TranslateService,
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

    protected onSaveSuccess(): void {
        this.loader.close();
        this.snack.open(this.t.instant('saved.success'), 'OK', {duration: 4000})
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
