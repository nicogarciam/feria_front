import {Component, OnDestroy, OnInit} from '@angular/core';
import {Observable, Subscription} from "rxjs";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {AppConfirmService} from "@services/app-confirm/app-confirm.service";
import {AppLoaderService} from "@services/app-loader/app-loader.service";
import {TranslateService} from "@ngx-translate/core";
import {JwtAuthService} from "@services/auth/jwt-auth.service";
import {HttpResponse} from "@angular/common/http";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {BankAccountService} from "@services/entities/bankAccount.service";
import {BankAccount, IBankAccount} from "@models/bankAccount.model";
import {AppErrorService} from "@services/app-error/app-error.service";
import {egretAnimations} from "@animations/egret-animations";

@Component({
  selector: 'app-bank-account-crud',
  templateUrl: './bank-account-crud.component.html',
  animations: egretAnimations,
  styleUrls: ['./bank-account-crud.component.scss']
})
export class BankAccountCrudComponent implements OnInit, OnDestroy {
  public items: IBankAccount[] = [];
  public rows: IBankAccount[] = [];
  public getItemSub: Subscription[] = [];
  public itemForm: FormGroup;
  public options;
  private bankAccountSelected: IBankAccount;
  loading = false;

  constructor(  private dialog: MatDialog, private snack: MatSnackBar, private bankAccountService: BankAccountService,
                private confirmService: AppConfirmService, private fb: FormBuilder, private errorService: AppErrorService,
                private loader: AppLoaderService, private t: TranslateService,
                private jwtAuth: JwtAuthService) { }

  ngOnInit(): void {
    this.options = {
      store_id: this.jwtAuth.getStore().id
    }
    this.getItems();
    this.buildItemForm(new BankAccount({store_id: this.jwtAuth.getStore().id}));
  }


  getItems() {
    this.loading = true;
    this.getItemSub.push(this.bankAccountService.query(this.options)
        .subscribe((res: HttpResponse<IBankAccount[]>) => {
              (this.rows = this.items = res.body || []);
              this.loading = false;
            },
            (error) => {
              this.errorService.error(error);
              this.loading = false;
            }
        ));
  }

  filter(event) {
    const val = event.target.value.toLowerCase();

    // filter our data
    const temp = this.items.filter(function (d) {
      return d.bank.toLowerCase().indexOf(val) !== -1
          || (d.alias != null && d.alias.toLowerCase().indexOf(val) !== -1)
          || (d.cbu != null && d.cbu.toLowerCase().indexOf(val) !== -1)
          || (d.cvu != null && d.cvu.toLowerCase().indexOf(val) !== -1)
          || !val ;
    });
    // update the rows
    this.rows = temp;
  }

  buildItemForm(entity: IBankAccount) {
    this.itemForm = this.fb.group({
      id: entity.id,
      bank: [entity.bank, [Validators.required]],
      cbu: entity.cbu,
      cvu: entity.cvu,
      alias: entity.alias,
    })
  }

  private createFromForm(): IBankAccount {
    return {
      ...new BankAccount(),
      id: this.itemForm.get(['id'])!.value,
      bank: this.itemForm.get(['bank'])!.value,
      cbu: this.itemForm.get(['cbu'])!.value,
      cvu: this.itemForm.get(['cvu']).value,
      alias: this.itemForm.get(['alias'])!.value,
      store_id: this.jwtAuth.getStore().id
    };
  }

  save(item): void {
    this.loading = true;
    if (item.id) {
      this.subscribeToSaveResponse(this.bankAccountService.update(item));
    } else {
      this.subscribeToSaveResponse(this.bankAccountService.create(item));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IBankAccount>>): void {
    this.getItemSub.push(result.subscribe(
        (res) => this.onSaveSuccess(),
        (error) => this.onSaveError(error.error)
    ));
  }

  protected onSaveSuccess(): void {
    this.getItems();
    this.loading = false;
    this.snack.open(this.t.instant('saved.success'), 'OK', {duration: 4000})
  }

  protected onSaveError(error): void {
    this.loading = false;
    this.snack.open('Error: ' + error.message, 'Ups!', {duration: 4000})
  }

  deleteItem(row) {
    this.loading = true;
    const message = this.t.instant('delete') + ' ' + row.description + ' ?'
    this.confirmService.confirm({title: this.t.instant('are.you.sure'), message: message})
        .subscribe(res => {
          if (res) {
            this.loader.open();
            this.bankAccountService.delete(row.id)
                .subscribe(list => {
                      this.getItems();
                      this.loading = false;
                      this.snack.open(this.t.instant('deleted'), 'OK', {duration: 4000})
                    },
                    (error => {
                      this.loading = false;
                      this.snack.open(this.t.instant('error'), 'Ups!', {duration: 4000})
                    }))
          }
        })
  }

  edit(row: IBankAccount) {
    this.bankAccountSelected = row;
    this.buildItemForm(row);
  }

  submit() {
    this.save(this.createFromForm());
  }

  ngOnDestroy(): void {
    this.getItemSub.forEach(sub => {
      sub.unsubscribe();
    })
    this.getItemSub = [];
  }
}
