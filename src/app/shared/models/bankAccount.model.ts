export interface IBankAccount {
    id?: number;
    store_id?: number;
    bank?: string;
    cbu?: string;
    cvu?: string;
    alias?: string;

}

export class BankAccount implements IBankAccount {
    constructor(o?: Partial<BankAccount>) {
        Object.assign(this, o);
    }
}

