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
import {AppErrorService} from "@services/app-error/app-error.service";
import {egretAnimations} from "@animations/egret-animations";
import {Discount, IDiscount} from "@models/discount.model";
import {DiscountService} from "@services/entities/discount.service";
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from "@angular/material/core";
import {APP_DATE_FORMATS, AppDateAdapter} from "@helpers/format-datepicker";

@Component({
  selector: 'app-discount-crud',
  templateUrl: './discount-crud.component.html',
  animations: egretAnimations,
  styleUrls: ['./discount-crud.component.scss'],
  providers: [
    {provide: DateAdapter, useClass: AppDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS},
    {provide: MAT_DATE_LOCALE, useValue: 'es'}
  ],
})
export class DiscountCrudComponent implements OnInit, OnDestroy {
  public items: IDiscount[] = [];
  public rows: IDiscount[] = [];
  public getItemSub: Subscription[] = [];
  public itemForm: FormGroup;
  public options;
  private discountSelected: IDiscount;
  loading = false;

  constructor(  private dialog: MatDialog, private snack: MatSnackBar, private discountService: DiscountService,
                private confirmService: AppConfirmService, private fb: FormBuilder, private errorService: AppErrorService,
                private loader: AppLoaderService, private t: TranslateService,
                private jwtAuth: JwtAuthService) { }

  ngOnInit(): void {
    this.options = {
      hotel_id: this.jwtAuth.getStore().id
    }
    this.getItems();
    this.newItemForm();
  }


  getItems() {
    this.loading = true;
    this.getItemSub.push(this.discountService.query(this.options)
        .subscribe((res: HttpResponse<IDiscount[]>) => {
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
      return d.description.toLowerCase().indexOf(val) !== -1
          || (d.discount != null && d.discount === val)
          // || (d.cbu != null && d.cbu.toLowerCase().indexOf(val) !== -1)
          // || (d.cvu != null && d.cvu.toLowerCase().indexOf(val) !== -1)
          || !val ;
    });
    // update the rows
    this.rows = temp;
  }

  buildItemForm(entity: IDiscount) {
    this.itemForm = this.fb.group({
      id: entity.id,
      discount: [entity.discount, [Validators.required]],
      description: entity.description,
      limit_discount: entity.limit_discount,
      active: entity.active,
      date_from: entity.date_from?.toDate() ? entity.date_from?.toDate() : new Date(),
      date_to: entity.date_to?.toDate() ? entity.date_to?.toDate() : new Date(),
      accommodation_type_id: entity.category_id,
    })
  }

  private createFromForm(): IDiscount {
    return {
      ...new Discount(),
      id: this.itemForm.get(['id'])!.value,
      discount: this.itemForm.get(['discount'])!.value,
      description: this.itemForm.get(['description'])!.value,
      limit_discount: this.itemForm.get(['limit_discount']).value,
      active: this.itemForm.get(['active'])!.value,
      store_id: this.jwtAuth.getStore().id,
      date_from: this.itemForm.get(['date_from'])!.value,
      date_to: this.itemForm.get(['date_to'])!.value,
      category_id: this.itemForm.get(['accommodation_type_id'])!.value,
    };
  }

  save(item): void {
    this.loading = true;
    if (item.id) {
      this.subscribeToSaveResponse(this.discountService.update(item));
    } else {
      this.subscribeToSaveResponse(this.discountService.create(item));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IDiscount>>): void {
    this.getItemSub.push(result.subscribe(
        (res) => this.onSaveSuccess(),
        (error) => this.onSaveError(error.error)
    ));
  }

  protected onSaveSuccess(): void {
    this.getItems();
    this.newItemForm();
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
            this.discountService.delete(row.id)
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

  edit(row: IDiscount) {
    this.discountSelected = row;
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

  changeActive(disc?: IDiscount) {
    const item = {...disc, active: !disc.active};
    this.subscribeToSaveResponse(this.discountService.update(item));
  }

  private newItemForm() {
    this.buildItemForm(new Discount({hotel_id: this.jwtAuth.getStore().id, active: true}));
  }
}
