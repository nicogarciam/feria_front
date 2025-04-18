import { Pipe, PipeTransform } from "@angular/core";
import {TranslateService} from '@ngx-translate/core';
import * as moment from "moment";

@Pipe({ name: 'momentFormat' })
export class MomentFormatPipe implements PipeTransform {
  constructor( private t: TranslateService) {
  }

  transform(value: Date | moment.Moment | undefined, dateFormat: string): any {

    return moment(value).format(dateFormat);
  }
}
