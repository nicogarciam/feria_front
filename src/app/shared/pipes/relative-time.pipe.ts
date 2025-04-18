import { Pipe, PipeTransform } from "@angular/core";
import {TranslateService} from '@ngx-translate/core';

@Pipe({ name: 'relativeTime' })
export class RelativeTimePipe implements PipeTransform {
  constructor( private t: TranslateService) {
  }

  transform(value: Date) {
    if(!(value instanceof Date))
      value = new Date(value);

    let seconds: number = Math.floor(((new Date()).getTime() - value.getTime()) / 1000);
    let interval: number = Math.floor(seconds / 31536000);

    if (interval > 1) {
      return interval + ' ' + this.t.instant('years.ago');
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
      return interval + ' ' + this.t.instant('month.ago');
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
      return interval + ' ' + this.t.instant('days.ago');
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
      return interval + ' ' + this.t.instant('hours.ago');
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
      return interval + ' ' + this.t.instant('minutes.ago');
    }
    return Math.floor(seconds) + ' ' + this.t.instant('seconds.ago');
  }
}
