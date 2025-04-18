import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import * as moment from 'moment';
import {environment} from '@environments/environment';
import {createRequestOption} from '@helpers/request-util';
import {Product, IProduct} from "@models/product.model";
import {Pageable} from "@models/pageable.model";

type EntityResponseType = HttpResponse<IProduct>;
type EntityArrayResponseType = HttpResponse<IProduct[]>;
type PageResponseType = HttpResponse<Pageable>;

@Injectable({providedIn: 'root'})
export class ProductService {
    public resourceUrl = environment.apiURL + '/products';
    public saleUrl = environment.apiURL + '/sales';

    constructor(protected http: HttpClient) {
    }

    create(productOption: IProduct): Observable<EntityResponseType> {
        const copy = this.convertDateFromClient(productOption);
        return this.http
            .post<IProduct>(this.resourceUrl, copy, {observe: 'response'})
            .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
    }


    update(product: IProduct): Observable<EntityResponseType> {
        const copy = this.convertDateFromClient(product);
        return this.http
            .put<IProduct>(this.resourceUrl + '/' + product.id, copy, {observe: 'response'})
            .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
    }


    find(id: number): Observable<EntityResponseType> {
        return this.http
            .get<IProduct>(`${this.resourceUrl}/${id}`, {observe: 'response'})
            .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
    }

    findByStore(storeId?: any): Observable<EntityArrayResponseType> {

        const url = storeId ?
            `${environment.apiURL}/store/${storeId}/products` :
            `${environment.apiURL}/products`;

        return this.http
            .get<IProduct[]>( url, {observe: 'response'});
    }


    query(req?: any): Observable<EntityArrayResponseType> {
        const options = createRequestOption(req);
        return this.http
            .get<IProduct[]>(this.resourceUrl, {params: options, observe: 'response'})
            .pipe(
                (map(
                    (res: EntityArrayResponseType) =>
                        this.convertDateArrayFromServer(res)
                ))
            );
    }

    queryPage(req?: any): Observable<PageResponseType> {
        const options = createRequestOption(req);
        return this.http
            .get<Pageable>(this.resourceUrl, {params: options, observe: 'response'})
            .pipe(
                (map(
                    (res: PageResponseType) =>
                        this.convertDatePageFromServer(res)
                ))
            );
    }


    myproducts(): Observable<EntityArrayResponseType>  {
        return this.http
            .get<IProduct[]>( environment.apiURL + "/my_products", {observe: 'response'})
            .pipe(
                (map(
                    (res: EntityArrayResponseType) =>
                        this.convertDateArrayFromServer(res)
                ))
            );
    }


    delete(id: number): Observable<HttpResponse<{}>> {
        return this.http.delete(`${this.resourceUrl}/${id}`, {observe: 'response'});
    }

    protected convertDateFromServer(res: EntityResponseType): EntityResponseType {
        if (res.body) {
            res.body.created_at = res.body.created_at ? moment(res.body.created_at) : null;
        }
        return res;
    }

    protected convertDateArrayFromServer(res: EntityArrayResponseType): EntityArrayResponseType {

        if (res.body) {
            res.body.forEach((product: IProduct) => {
                product.created_at = product.created_at ? moment(product.created_at) : null;
            });
        }

        return res;
    }


    protected convertDatePageFromServer(res: PageResponseType): PageResponseType {

        if (res.body.data) {
            res.body.data.forEach((product: IProduct) => {
                product.created_at = product.created_at ? moment(product.created_at) : null;
            });
        }

        return res;
    }


    protected convertDateFromClient(ent: IProduct): IProduct {
        return new Product({...ent,
        store_id: ent.store?.id, store: {}});
    }

    findForSale(saleId: number): Observable<EntityArrayResponseType> {
        return this.http
            .get<IProduct[]>(`${this.saleUrl}/${saleId}/products`, {observe: 'response'})
            .pipe(
                (map(
                    (res: EntityArrayResponseType) =>
                        this.convertDateArrayFromServer(res)
                ))
            );
    }
}
