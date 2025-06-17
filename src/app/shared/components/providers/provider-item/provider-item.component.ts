import {Component, OnInit, Input, Type} from '@angular/core';
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
  _layout = { layout: 'row', align: 'space-between center'};

  @Input()
  get layout(): any {
    return this._layout;
  }

  set layout(value: any) {
    if (value !== undefined) {
      this._layout = value === 'row' ? { layout: 'row', align: 'space-between center'} :
          { layout: 'column', align: 'space-between start'};
    }
  }


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
  }

}
