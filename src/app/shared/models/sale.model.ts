import {Moment} from 'moment';
import {IStore} from './store.model';
import {IProduct} from "./product.model";
import {ISaleState} from "@models/saleState.model";
import {IPay} from "@models/pay.model";
import {ICustomer} from "@models/customer.model";

export interface ISale {
  code?: number;
  id?: number;
  store?: IStore;
  store_id?: number;
  customer_id?: number,
  customer?: ICustomer,
  sale_state_id?: number,
  sale_state?: ISaleState,
  date_sale?: Moment;
  date_pay?: Moment;
  note?: string;
  total_price?: number,
  total_paid?: number,
  coupon_code?: string;
  days_to_confirm?: number;
  days_to_cancel?: number;
  created_at?: Moment;
  products?: IProduct[];
  discount?: number,
  pays?: IPay[],

}

export class Sale implements ISale {

  constructor(o?: Partial<Sale>) {
    Object.assign(this, o);
  }

}
