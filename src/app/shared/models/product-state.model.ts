export interface IProductState {
    id?: number;
    name?: string;
    color?: string;
}

export class ProductState implements IProductState {
    constructor(o?: Partial<ProductState>) {
        Object.assign(this, o);
    }
}
