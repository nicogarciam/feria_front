import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {environment} from '@environments/environment';
import {createRequestOption} from '@helpers/request-util';
import {IProduct} from "@models/product.model";
import {Pageable} from "@models/pageable.model";
import {IProductState} from "@models/product-state.model";

type EntityResponseType = HttpResponse<IProductState>;
type EntityArrayResponseType = HttpResponse<IProductState[]>;
type PageResponseType = HttpResponse<Pageable>;

@Injectable({providedIn: 'root'})
export class ProductStateService {
    public resourceUrl = environment.apiURL + '/product_state';

    constructor(protected http: HttpClient) {
    }

    create(prodState: IProductState): Observable<EntityResponseType> {
        return this.http
            .post<IProduct>(this.resourceUrl, prodState, {observe: 'response'})
            .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
    }


    update(prodState: IProductState): Observable<EntityResponseType> {
        return this.http
            .put<IProductState>(this.resourceUrl + '/' + prodState.id, prodState, {observe: 'response'})
            .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
    }


    find(id: number): Observable<EntityResponseType> {
        return this.http
            .get<IProductState>(`${this.resourceUrl}/${id}`, {observe: 'response'})
            .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
    }

    query(req?: any): Observable<EntityArrayResponseType> {
        const options = createRequestOption(req);
        return this.http
            .get<IProductState[]>(this.resourceUrl, {params: options, observe: 'response'})
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
        // if (res.body) {
        //     res.body.created_at = res.body.created_at ? moment(res.body.created_at) : null;
        // }
        return res;
    }

    protected convertDateArrayFromServer(res: EntityArrayResponseType): EntityArrayResponseType {

        // if (res.body) {
        //     res.body.forEach((product: IProductState) => {
        //         product.created_at = product.created_at ? moment(product.created_at) : null;
        //     });
        // }

        return res;
    }

}
