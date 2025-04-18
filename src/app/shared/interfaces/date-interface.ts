import {IProduct} from "@models/product.model";
import {ISale} from "@models/sale.model";
import {Moment} from "moment";

export interface DayCalendarElement {
  id?: string;
  name?: string;
  day?: number,
  month?: number,
  year?: number,
  booking?: ISale,
  accommodation?: IProduct
  disabled?: boolean,
  reserved?: boolean,
  consulted?: boolean,
  order?: number,
  date?: Moment,
  // periodicElement?: PeriodicElement,
  isWeekEnd?: boolean;
  today?: boolean;
}

export interface WeekCalendarInterface {
  name?: string;
  number?: number;
  date_from?: Moment;
  date_to?: Moment;
  calendarDays?: DayCalendarElement[];
}


export interface MonthCalendarInterface {
  name?: string;
  number?: number;
  date?: Moment;
  cantDays?: number;
  calendarWeeks?: WeekCalendarInterface[];
  calendarDays?: DayCalendarElement[];
}
