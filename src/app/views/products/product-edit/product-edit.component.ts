import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {IProduct, Product} from '@models/product.model';
import {FormBuilder} from "@angular/forms";
import {AppConfirmService} from "@services/app-confirm/app-confirm.service";
import {AppErrorService} from "@services/app-error/app-error.service";
import {ActivatedRoute} from "@angular/router";
import {AppLoaderService} from "@services/app-loader/app-loader.service";
import {ProductService} from "@services/entities/product.service";
import {TranslateService} from "@ngx-translate/core";
import {LayoutService} from "@services/layout.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-product-edit',
  templateUrl: './product-edit.component.html',
  styleUrls: ['./product-edit.component.scss']
})
export class ProductEditComponent implements OnInit, OnDestroy {
  product: IProduct;
  public getItemSub: Subscription[] = [];
  @Input() productID;

  constructor(private fb: FormBuilder, private confirmService: AppConfirmService,
              private errorService: AppErrorService, private router: ActivatedRoute,
              private loader: AppLoaderService, private productService: ProductService,
              private t: TranslateService, public layout: LayoutService,
              private snack: MatSnackBar,) {
  }

  ngOnInit() {

    this.layout.setProperty({useBreadcrumb: true})
    this.productID = this.router.snapshot.params.productID;
    this.getItemSub.push(
        this.productService.find(this.productID)
            .subscribe((res) => {
                  (this.product = res.body);
                },
                (error) => {
                  console.log(error);
                  this.errorService.error(error);
                }
            ));

  }

  ngOnDestroy() {
    this.getItemSub.forEach(sub => sub.unsubscribe());
    this.getItemSub = [];
    this.layout.setProperty({useBreadcrumb: false})
  }

} 
