export interface ICategory {
    id?: number;
    name?: string;
    color?: string;
    store_id?: number;
}

export class Category implements ICategory {
    constructor(o?: Partial<ICategory>) {
        Object.assign(this, o);
    }
}
