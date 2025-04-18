import {Moment} from 'moment';
import * as moment from "moment";

export interface IDiscount {
    id?: number;
    store_id?: number;
    date_from?: Moment;
    date_to?: Moment;
    description?: string;
    limit_discount?: number;
    category_id?: number;
    discount?: number;
    active?: boolean;
}

export class Discount implements IDiscount {

    constructor(o?: Partial<Discount>) {
        Object.assign(this, o);
    }
}

