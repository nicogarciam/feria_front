import {Moment} from 'moment';
import {IStore} from './store.model';
import {ICategory} from "./category.model";
import {ISale} from "./sale.model";
import {MonthCalendarInterface} from "@interfaces/date-interface";
import {IProductState} from "@models/product-state.model";
import {IProvider} from "@models/provider.model";

export interface IProduct {

  id?: number;
  code?: string;
  name?: string;
  subtitle?: string;
  description?: string;
  store?: IStore;
  store_id?: number;
  category_id?: number;
  category?: ICategory;
  provider_id?: number;
  provider?: IProvider;
  state_id?: number;
  state?: IProductState;
  color?: string;
  size?: string;
  price?: number;
  fee?: number;
  cost?: number;
  sale?: ISale;
  note?: string;

  created_at?: Moment;

  _id?: string;
  // category?: string;
  tags?: string[];
  ratings?: {
    rating: number,
    ratingCount: number
  };
  features?: string[];
  photo?: string;
  gallery?: string[];
  badge?: { text: string, color?: string };


}

export class Product implements IProduct {

  constructor(o?: Partial<IProduct>) {
    Object.assign(this, o);
  }
}
