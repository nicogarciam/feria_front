import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {AccountService} from '@services/entities/account.service';
import {HttpResponse} from '@angular/common/http';
import {AppLoaderService} from '@services/app-loader/app-loader.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {TranslateService} from '@ngx-translate/core';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {egretAnimations} from '@animations/egret-animations';
import {JwtAuthService} from '@services/auth/jwt-auth.service';
import {enableScroll, preventScroll} from "@helpers/scroll-helper";
import {Sale} from "@models/sale.model";
import {Customer, ICustomer} from "@models/customer.model";
import {CustomerService} from "@services/entities/customer.service";
import {AppErrorService} from "@services/app-error/app-error.service";
import {AppConfirmService} from "@services/app-confirm/app-confirm.service";
import {IProvider} from "@models/provider.model";
import {ProviderService} from "@services/entities/provider.service";

@Component({
    selector: 'app-provider',
    templateUrl: './provider.component.html',
    styleUrls: ['./provider.component.css'],
    animations: egretAnimations
})
export class ProviderComponent implements OnInit, OnDestroy {
    activeView = 'overview';
    public options;
    overviewOn = true;
    settingsOn = false;
    getItemSub: Subscription[] = [];
    viewDetail = false;
    selectedItem: IProvider;
    rows: IProvider[] = [];
    itemsFilter: IProvider[] = [];
    editing = {};
    loading = false;


    constructor(private router: ActivatedRoute, private providerService: ProviderService,
                private accountService: AccountService, private loader: AppLoaderService,
                private snack: MatSnackBar, private t: TranslateService, private confirmService: AppConfirmService,
                public jwtAuth: JwtAuthService, private error: AppErrorService) {
    }

    ngOnInit() {
        this.options = {
            store_id: this.jwtAuth.getStore().id
        }
        this.getItems();

    }

    ngOnDestroy(): void {
        this.getItemSub.forEach(sub => {
            sub.unsubscribe();
        })
        this.getItemSub = [];
    }

    getItems() {
        this.loading = true;
        this.getItemSub.push(this.providerService.query(this.options)
            .subscribe((res: HttpResponse<IProvider[]>) => {
                    (this.rows = this.itemsFilter = res.body || []);
                    this.loading = false;
                },
                (error) => {
                    this.error.error(error);
                    this.loading = false;
                }
            ));
    }

    filter(event) {
        const val = event.target.value.toLowerCase();

        // filter our data
        const temp = this.itemsFilter.filter(function (d) {
            return d.name.toLowerCase().indexOf(val) !== -1
                || (d.contact_name != null && d.contact_name.toLowerCase().indexOf(val) !== -1)
                || (d.email != null && d.email.toLowerCase().indexOf(val) !== -1)
                || !val ;
        });
        // update the rows
        this.rows = temp;
    }


    updateValue(event, cell, rowIndex) {
        this.rows[rowIndex][cell] = event.target.value;
        this.rows = [...this.rows];
    }


    disableScroll(e: Event) {
        preventScroll(e);
    }

    enableScroll(e: Event) {
        enableScroll(e);
    }

    gotoOverview() {
        this.overviewOn = true;
        this.settingsOn = false;
    }

    gotoSettings() {
        this.overviewOn = false;
        this.settingsOn = true;
    }

    cancelLateralForm() {
        this.viewDetail = false;
    }

    savedItem() {
        this.viewDetail = false;
        this.selectedItem = null;
    }

    saveItem(rowIndex: any) {
        const cust = this.rows[rowIndex];
        this.save(cust);
        this.editing[rowIndex] = false;
    }



    save(item): void {
        this.loading = true;
        if (item.id) {
            this.subscribeToSaveResponse(this.providerService.update(item));
        } else {
            this.subscribeToSaveResponse(this.providerService.create(item));
        }
    }

    protected subscribeToSaveResponse(result: Observable<HttpResponse<ICustomer>>): void {
        this.getItemSub.push(result.subscribe(
            (res) => this.onSaveSuccess(),
            (error) => this.onSaveError(error.error)
        ));
    }

    protected onSaveSuccess(): void {
        // this.getItems();
        this.loading = false;
        this.snack.open(this.t.instant('saved.success'), 'OK', {duration: 4000})
    }

    protected onSaveError(error): void {
        this.loading = false;
        this.snack.open('Error: ' + error.message, 'Ups!', {duration: 4000})
    }

    deleteItem(row) {
        this.loading = true;
        const message = this.t.instant('delete') + ' ' + row.name + ' ?'
        this.confirmService.confirm({title: this.t.instant('are.you.sure'), message: message})
            .subscribe(res => {
                if (res) {
                    this.loader.open();
                    this.providerService.delete(row.id)
                        .subscribe(list => {
                                this.getItems();
                                this.loading = false;
                                this.snack.open(this.t.instant('deleted'), 'OK', {duration: 4000})
                            },
                            (error => {
                                this.loading = false;
                                this.error.error(error);
                                this.snack.open(this.t.instant('error'), 'Ups!', {duration: 4000})
                            }))
                }
            })
    }

    showDetail(rowIndex: number) {
        this.selectedItem = this.rows[rowIndex];
        this.viewDetail = true;
    }
}
