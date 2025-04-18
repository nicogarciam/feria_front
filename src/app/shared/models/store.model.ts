import {ICity} from './city.model';
import {IUser} from "./user.model";

export interface IStore {
  id?: number;
  name?: string;
  address?: string;
  latitud?: number;
  longitud?: number;
  logo?: string;
  state?: string;
  email?: string;
  phone?: string;
  city?: ICity;
  city_id?: number;
  web?: string;
  instagram?: string;
  facebook?: string;
  description?: string;
  owner_id?: number;

  owner?: IUser;

  ratings?: {
    rating: number,
    ratingCount: number
  };
}

export class Store implements IStore {
  constructor(o?: Partial<Store>) {
    Object.assign(this, o);
  }
}
