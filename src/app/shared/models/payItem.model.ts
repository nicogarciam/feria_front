import {Moment} from 'moment';
import {IPay} from './pay.model';

export interface IPayItem {
    id?: number;
    date?: Moment;
    amount?: number;
    concept?: string;
    ref_id?: number;
    paid?: boolean;
    pay_id?: number;
    account?: IPay;
}

export class PayItem implements IPayItem {
    constructor(o?: Partial<PayItem>) {
        Object.assign(this, o);
    }
}

export const pay_methods = [
    {id: 1, dsc: 'cash'},
    {id: 2, dsc: 'creditcard'},
    {id: 3, dsc: 'mercadopago'},
]

export function getPayMethod(id: number) {
    return pay_methods.find(pm => pm.id === id );
}
