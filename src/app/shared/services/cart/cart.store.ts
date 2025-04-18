import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import {CartItem} from "../../models/cartItem";
import {ICustomer} from "../../models/customer.model";
import {Injectable} from "@angular/core";

export interface CartState extends EntityState<CartItem, number> {
    customer?: ICustomer;
    count?: number;
}

@Injectable({
    providedIn: 'root'
})
@StoreConfig({ name: 'cart' })
export class CartStore extends EntityStore<CartState> {
    constructor() {
        super({ count: 0 }) ;
    }

}
