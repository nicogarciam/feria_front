import {IProduct} from "./product.model";

export interface CartItem {
    id?: number;
    product: IProduct;
    data: {
        quantity: number,
        options?: any
    };
}

