import {ISale} from "@models/sale.model";


export function saleLike(val: string, sa: ISale): boolean {
    let res = false;
    const lv = val.toLowerCase();
    res = sa.code.toString().toLowerCase().indexOf(lv) !== -1;
    res = res || sa.customer != null && sa.customer.name.toLowerCase().indexOf(lv) !== -1;
    res = res || sa.products != null && sa.products.some(acc => acc.code.toLowerCase().indexOf(lv) !== -1) ;
    res = res || !val;

    console.log(res);
    return res;
}
