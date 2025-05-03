import {Component, OnInit, Input, Type} from '@angular/core';
import {IProduct} from "@models/product.model";
import {FormControl} from "@angular/forms";
import {IProvider} from "@models/provider.model";


interface Hours {
  ini: string;
  end: string;
}

@Component({
  selector: 'app-provider-item',
  templateUrl: './provider-item.component.html',
  styleUrls: ['./provider-item.component.scss']
})
export class ProviderItemComponent implements OnInit {


  _provider: IProvider

  @Input()
  get provider(): IProvider {
    return this._provider;
  }

  set provider(value: IProvider) {
    if (value !== undefined) {
      this._provider = value;
    }
  }

  constructor() {
  }

  ngOnInit() {
  }

  openProvider() {
    console.log(this.provider);
  }

}
