import {Moment} from 'moment';
import {ICustomer} from "./customer.model";

export interface IVoucher {
  id?: number;
  cod?: string;
  name?: string;
  description?: string;
  state?: string;
  date_start?: Moment;
  date_end?: Moment;
  customer_used_id?: number;
  discount?: number;
  customer?: ICustomer;

}

export class Voucher implements IVoucher {
  constructor(o?: Partial<Voucher>) {
    Object.assign(this, o);
  }
}
