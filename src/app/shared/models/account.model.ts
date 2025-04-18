import {City} from './city.model';
import {IStore} from './store.model';
import {Moment} from 'moment';
import {User} from './user.model';

export interface IAccount {
    id?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    langKey?: string;
    gender?: string;
    image_url?: string;
    phone?: string;
    address?: string;
    dni?: string;
    birthday?: Moment;
    city?: City;
    entity?: IStore;
    user?: User;
    city_id?: number;
    account_cod?: string;
}

export class Account implements IAccount {

    constructor(o?: Partial<Account>) {
        Object.assign(this, o);
    }
}
