import {Injectable} from '@angular/core';
import {CartItem} from "@models/cartItem";
import {CartStore} from "./cart.store";


@Injectable({ providedIn: 'root' })
export class CartService {

    constructor(private cartStore: CartStore) {
    }

    public get cart() {
        return this.cartStore.getValue();
    }


    public addToCart(cartItem: CartItem) {
        this.cartStore.add(cartItem);
    }


    public remove(cartItem: CartItem) {
      this.cartStore.remove(cartItem.id);
    }

    changeProductState({ id, newStateId }) {
        this.cartStore.update(id, entity => {
            return {
                product: {
                    ...entity.product,
                    state_id: newStateId
                }
            }
        });
    }
}
