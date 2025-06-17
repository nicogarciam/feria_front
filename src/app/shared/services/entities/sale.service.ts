import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import * as moment from 'moment';

import {ISale, Sale} from '@models/sale.model';
import {environment} from '@environments/environment';
import {createRequestOption} from '@helpers/request-util';
import {saleStateFactory, ISaleState} from "@models/saleState.model";

type EntityResponseType = HttpResponse<ISale>;
type EntityArrayResponseType = HttpResponse<ISale[]>;

@Injectable({providedIn: 'root'})
export class SaleService {
    public resourceUrl = environment.apiURL + '/sales';
    public saleStatesUrl = environment.apiURL + '/sale_states';

    constructor(protected http: HttpClient) {
    }

    create(entity: ISale): Observable<EntityResponseType> {
        const copy = this.convertDateFromClient(entity);
        return this.http
            .post<ISale>(this.resourceUrl, copy, {observe: 'response'})
            .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
    }


    update(entity: ISale): Observable<EntityResponseType> {
        const copy = this.convertDateFromClient(entity);
        return this.http
            .put<ISale>(this.resourceUrl + '/' + copy.id, copy, {observe: 'response'})
            .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
    }


    find(id: number): Observable<EntityResponseType> {
        return this.http
            .get<ISale>(`${this.resourceUrl}/${id}`, {observe: 'response'})
            .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
    }

    query(req?: any): Observable<EntityArrayResponseType> {
        const options = createRequestOption(req);
        return this.http
            .get<ISale[]>(this.resourceUrl, {params: options, observe: 'response'})
            .pipe(
                (map(
                    (res: EntityArrayResponseType) =>
                        this.convertDateArrayFromServer(res)
                ))
            );
    }

    queryResume(req: any): Observable<HttpResponse<[]>> {
        const options = createRequestOption(req);
        return this.http.get<[]>(this.resourceUrl + "/resume", {params: options, observe: 'response'});
    }

    mySales(): Observable<EntityArrayResponseType> {
        return this.http
            .get<ISale[]>(environment.apiURL + "/my_sales", {observe: 'response'})
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
            this.setDates(res.body);
        }
        return res;
    }

    protected convertDateArrayFromServer(res: EntityArrayResponseType): EntityArrayResponseType {
        if (res.body) {
            res.body.forEach((entity: ISale) => {
                this.setDates(entity);
            });
        }
        return res;
    }

    protected setDates(entity: ISale) {
        entity.date_pay = entity.date_pay ? moment(entity.date_pay) : null;
        entity.date_sale = entity.date_sale ? moment(entity.date_sale) : null;
        entity.created_at = entity.created_at ? moment(entity.created_at) : null;
    }


    protected convertDateFromClient(ent: ISale): ISale {
        const b: ISale = new Sale({
            ...ent, store: null, state: null,
            customer_id: ent.customer?.id, customer: null, pays: null
        });

        return b;

    }

    // SALE STATES
    public setSaleState(state: string, sale: ISale) {
        const newState = saleStateFactory[state];
    }


    queryStates(sale_id: number, query: any): Observable<HttpResponse<ISaleState[]>> {
        const options = createRequestOption(query);
        return this.http
            .get<ISaleState[]>(`${this.resourceUrl}/${sale_id}/statuses`, {params: options, observe: 'response'})
            .pipe(
                map((res: HttpResponse<ISaleState[]>) => this.convertDateArrayStatesFromServer(res)
                ));

    }


    protected convertDateArrayStatesFromServer(res: HttpResponse<ISaleState[]>): HttpResponse<ISaleState[]> {
        if (res.body) {
            res.body.forEach((entity: ISaleState) => {
                entity.date_from = entity.date_from ? moment(entity.date_from) : null;
                entity.date_to = entity.date_to ? moment(entity.date_to) : null;
            });
        }
        return res;
    }


}
