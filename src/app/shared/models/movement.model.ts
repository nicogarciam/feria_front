import {Moment} from 'moment';
import {IAccount} from './account.model';
import {IPay} from './pay.model';
import {IProvider} from "@models/provider.model";

export interface IMovement {
  id?: number;
  store_id?: number;
  customer_id?: number;
  customer?: IProvider;
  provider_id?: number;
  provider?: IProvider;
  concept?: string;
  date?: Moment;
  isQuote?: boolean;
  amount?: number;
  type?: string;
  account?: IAccount;
  pay?: IPay;
  month?: string;
  balance?: number;
}

export class Movement implements IMovement {
  constructor(o?: Partial<Movement>) {
    Object.assign(this, o);
  }
}
