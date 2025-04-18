import { Moment } from 'moment';

export interface ICustomer {
  id?: number;
  name?: string;
  email?: string;
  address?: string;
  phone?: string;
  token?: string;
  password?: string;
  city_id?: number;
  photo?: string;
}

export class Customer implements ICustomer {
  constructor(o?: Partial<Customer>) {
    Object.assign(this, o);
  }
}
