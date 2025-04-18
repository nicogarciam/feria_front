import { Component, OnInit, Input } from '@angular/core';
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'button-loading',
  templateUrl: './button-loading.component.html',
  styleUrls: ['./button-loading.component.scss']
})
export class ButtonLoadingComponent implements OnInit {

  @Input('loading') loading: boolean;
  @Input('disable') disable = false;
  @Input('btnClass') btnClass: string;
  @Input('raised') raised = true;
  @Input('loadingText') loadingText = '';
  @Input('type') type: 'button' | 'submit' = 'submit';
  @Input('color') color: 'primary' | 'accent' | 'warn';

  constructor() {
  }

  ngOnInit() {
  }

}
