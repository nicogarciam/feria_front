import { Moment } from 'moment';
import {Store} from './store.model';

export interface IProvider {
  id?: number;
  name?: string;
  date_start?: Moment;
  birthday?: Moment;
  address?: string;
  gender?: string;
  email?: string;
  phone?: string;
  photo?: string;
  title?: string;
  document?: string;
  entity?: Store;
  cuil?: string,
  city_id?: number,
  contact_name?: string
}

export class Provider implements IProvider {
  constructor(o?: Partial<Provider>) {
    Object.assign(this, o);
  }
}
