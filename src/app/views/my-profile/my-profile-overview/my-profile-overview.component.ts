import {Component, Input, OnInit} from '@angular/core';
import {IAccount} from '../../../shared/models/account.model';
import {IPay} from '../../../shared/models/pay.model';
import {MatDialog} from '@angular/material/dialog';
import {AppLoaderService} from '../../../shared/services/app-loader/app-loader.service';
import {TranslateService} from '@ngx-translate/core';
import {BehaviorSubject} from 'rxjs';
import {HttpResponse} from '@angular/common/http';
import {PayService} from '../../../shared/services/entities/pay.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {egretAnimations} from '../../../shared/animations/egret-animations';
import {AccountService} from "@services/entities/account.service";

@Component({
    selector: 'app-my-profile-overview',
    templateUrl: './my-profile-overview.component.html',
    styleUrls: ['./my-profile-overview.component.css'],
    animations: egretAnimations
})
export class MyProfileOverviewComponent implements OnInit {

    accounts: IAccount[];
    pays: IPay[] = [];

    loadingPays = true;
    loadingAccount = false;
    loadingActivities = false;

    private _account = new BehaviorSubject<IAccount>({});

    @Input()
    set account(value) {
        this._account.next(value);
    };

    get account() {
        return this._account.getValue();
    }


    constructor(
        private t: TranslateService, private loader: AppLoaderService,
        private dialog: MatDialog, private payService: PayService,
        private accountService: AccountService) {
    }

    ngOnInit() {
        this._account
            .subscribe(
            account => {
                if (account.id !== undefined) {
                    this.getActivities();
                }
            },
            error => console.log(error)
        )
    }

    getActivities() {
        this.loadingActivities = true;

    }

    getAccount() {
        this.loadingAccount = true;

    }


}
