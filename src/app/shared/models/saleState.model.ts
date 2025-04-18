import {Moment} from 'moment';
import * as moment from "moment";

export interface ISaleState {
    id?: number;
    date_from?: Moment;
    date_to?: Moment;
    name?: string;
    note?: string;
    event?: string;
    user_name?: string;
    user_email?: string;
    state?: string;
    color?: string;
    action?: string;

    cambiarEstado(): void;
    toString(): string;

}

export class SaleState implements ISaleState {

    action = 'next';
    constructor(o?: Partial<SaleState>) {
        Object.assign(this, o);
    }

    cambiarEstado(): void {
        // Cambiar el estado de la tarea a "completa"
    }

    toString(): string {
        return 'BaseState';
    }
}


export class NewSale implements ISaleState {

    action = 'pay';
    constructor(o?: Partial<ISaleState>) {
        Object.assign(this, o);
    }

    cambiarEstado(): void {
        // Cambiar el estado de la tarea a "completa"
    }

    toString(): string {
        return SaleStateEnum.NEW;
    }
}

export class SaleConfirmed implements ISaleState {

    action = 'checkin';

    constructor(o?: Partial<ISaleState>) {
        Object.assign(this, o);
    }

    cambiarEstado(): void {
        // Cambiar el estado de la tarea a "completa"
    }

    toString(): string {
        return SaleStateEnum.CONFIRMED;
    }
}
export class SaleCanceled implements ISaleState {
    action = 'pay';
    constructor(o?: Partial<ISaleState>) {
        Object.assign(this, o);
    }

    cambiarEstado(): void {
        // Cambiar el estado de la tarea a "completa"
    }

    toString(): string {
        return SaleStateEnum.CANCELED;
    }
}
export class SalePaid implements ISaleState {
    action = 'next';
    constructor(o?: Partial<ISaleState>) {
        Object.assign(this, o);
    }

    cambiarEstado(): void {
        // Cambiar el estado de la tarea a "completa"
    }

    toString(): string {
        return SaleStateEnum.PAID;
    }
}
export class SaleClosed implements ISaleState {
    action = 'noaction';
    constructor(o?: Partial<ISaleState>) {
        Object.assign(this, o);
    }

    cambiarEstado(): void {
        // Cambiar el estado de la tarea a "completa"
    }

    toString(): string {
        return SaleStateEnum.CLOSED;
    }
}


enum SaleStateEnum {
    NEW = 'new',
    CONFIRMED = 'confirmed',
    CANCELED= 'canceled',
    PAID= 'paid',
    CLOSED= 'CLOSED',
}


export function bookingStateConstructor(state: ISaleState) {
    const st = saleStateFactory[state.state];
    st.assign(state);
    return st;
}

export let saleStateFactory = {
    'NEW': new NewSale({
        date_from: moment(),
        name: 'new',
        color: '#fcfb7c'
    }),
    'CONFIRMED': new SaleConfirmed({
        date_from: moment(),
        name: 'confirmed',
        color: "#5c8c0f"
    }),
    'CANCELED': new SaleCanceled({
        date_from: moment(),
        name: 'canceled',
        color: "#e54444"
    }),
    'PAID': new SalePaid({
        date_from: moment(),
        name: 'paid',
        color: "#216740"
    }),
    'CLOSED': new SaleClosed({
        date_from: moment(),
        name: 'closed',
        color: "#6d6d6e"
    })
}


