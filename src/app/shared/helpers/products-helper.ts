import {IProduct} from "@models/product.model";


export function productLike(val: string, prod: IProduct): boolean {
    let res = false;
    const lv = val.toLowerCase();
    res = prod.code.toString().toLowerCase().indexOf(lv) !== -1;
    res = res || prod.description != null && prod.description.toLowerCase().indexOf(lv) !== -1;
    res = res || prod.category != null && prod.category.name.toLowerCase().indexOf(lv) !== -1 ;
    res = res || prod.provider != null && prod.provider.name.toLowerCase().indexOf(lv) !== -1 ;
    res = res || !val;

    return res;
}
