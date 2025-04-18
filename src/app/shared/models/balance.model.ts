import {IMovement} from "./movement.model";
import {IBankAccount} from "./bankAccount.model";
import {Moment} from "moment";

export interface IBalance {
    hotel_id?: number;
    customer_id?: number;
    bank_account?: IBankAccount;
    movements?: IMovement[];
    balance_total?: number;
    date_from?: Moment;
    date_to?: Moment;
    balance_prev?: number;
    balance_final?: number;
    state?: string;
}

export class Balance implements IBalance {
    constructor(o?: Partial<Balance>) {
        Object.assign(this, o);
    }
}

