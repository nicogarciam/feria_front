import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {environment} from '../../../../environments/environment';
import {createRequestOption} from '../../helpers/request-util';
import * as moment from "moment";
import {IDiscount} from "../../models/discount.model";

type ResponseType = HttpResponse<IDiscount>;
type ArrayResponseType = HttpResponse<IDiscount[]>;

@Injectable({providedIn: 'root'})
export class DiscountService {
    public resourceUrl = environment.apiURL + '/discounts';

    constructor(protected http: HttpClient) {
    }

    create(entity: IDiscount): Observable<ResponseType> {
        // const copy = this.convertDateFromClient(entity);
        return this.http
            .post<IDiscount>(this.resourceUrl, entity, {observe: 'response'})
            .pipe(map((res: ResponseType) => this.convertDateFromServer(res)));
    }


    update(entity: IDiscount): Observable<ResponseType> {
        // const copy = this.convertDateFromClient(entity);
        return this.http
            .put<IDiscount>(this.resourceUrl + '/' + entity.id, entity, {observe: 'response'})
            .pipe(map((res: ResponseType) => res));
    }

    find(id: number): Observable<ResponseType> {
        return this.http
            .get<IDiscount>(`${this.resourceUrl}/${id}`, {observe: 'response'})
            .pipe(map((res: ResponseType) => this.convertDateFromServer(res)));
    }

    query(req?: any): Observable<ArrayResponseType> {
        const options = createRequestOption(req);
        // console.log("Pays Service . Query: ", req );
        return this.http
            .get<IDiscount[]>(this.resourceUrl, {params: options, observe: 'response'})
            .pipe(map((res: ArrayResponseType) => this.convertDateArrayFromServer(res)));
    }

    delete(id: number): Observable<HttpResponse<{}>> {
        return this.http.delete(`${this.resourceUrl}/${id}`, {observe: 'response'});
    }

    protected convertDateArrayFromServer(res: ArrayResponseType): ArrayResponseType {
        if (res.body) {
            res.body.forEach((entity: IDiscount) => {
                this.setDates(entity);
            });
        }
        return res;
    }
    protected convertDateFromServer(res: ResponseType): ResponseType {
        if (res.body) {
            this.setDates(res.body);
        }
        return res;
    }

    protected setDates(entity: IDiscount) {
        entity.date_from = entity.date_from ? moment(entity.date_from) : null;
        entity.date_to = entity.date_to ? moment(entity.date_to) : null;
    }


}
