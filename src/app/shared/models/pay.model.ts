import {Moment} from 'moment';
import {ISale} from "@models/sale.model";
import {ICustomer} from "@models/customer.model";
import {IBankAccount} from "@models/bankAccount.model";

export interface IPay {
    id?: number;
    pay_date?: Moment;
    pay_method?: number;
    pay_method_dsc?: string;
    pay_ref?: string;
    ref_detail?: string;
    amount?: number;
    sale?: ISale;
    state?: string;
    detail?: string;
    concept?: string;
    type?: string;
    store_id?: number;
    sale_id?: number;
    discount?: number;
    discount_cod?: number;
    discount_dsc?: string;
    user_id?: number;
    customer_id?: number;
    customer?: ICustomer;
    bank_account_id?: number;
    bankAccount?: IBankAccount;
}

export class Pay implements IPay {
    constructor(o?: Partial<Pay>) {
        Object.assign(this, o);
    }
}

export const pay_methods = [
    {id: 1, dsc: 'cash'},
    {id: 2, dsc: 'creditcard'},
    {id: 3, dsc: 'mercadopago'},
    {id: 4, dsc: 'bank_transfer'},
];

export const banks = [
    {id: 1, name: 'BANCO NACION'},
    {id: 2, name: 'BANCO PATAGONIA'},
    {id: 3, name: 'SANTANDER'}
];

export const payTypes = [
    'PAY',
    'SIGN',
    'PAY_OFF'
];


export function getPayMethod(id: number) {
    return pay_methods.find(pm => pm.id === id );
}
