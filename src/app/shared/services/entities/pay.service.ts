import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import * as moment from 'moment';
import {environment} from '@environments/environment';
import {DATE_FORMAT} from '../../constants/input.constants';
import {createRequestOption} from '@helpers/request-util';
import {IPay} from '@models/pay.model';
import {IProduct} from "@models/product.model";

type ResponseType = HttpResponse<IPay>;
type ArrayResponseType = HttpResponse<IPay[]>;

@Injectable({providedIn: 'root'})
export class PayService {
    public resourceUrl = environment.apiURL + '/payments';
    public saleUrl = environment.apiURL + '/sales';

    constructor(protected http: HttpClient) {
    }

    create(entity: IPay): Observable<ResponseType> {
        return this.http
            .post<IPay>(this.resourceUrl, entity, {observe: 'response'})
            .pipe(map((res: ResponseType) => this.convertDateFromServer(res)));
    }

    payFees(pay: IPay): Observable<ResponseType> {
        const request = {
            ...pay,
            booking: {id: pay.sale.id},
            booking_id: pay.sale.id,
            hotel_id: pay.sale.store_id,


        }
        return this.http
            .post<IPay>(this.resourceUrl + "/pay_fees", request, {observe: 'response'})
            .pipe(map((res: ResponseType) => this.convertDateFromServer(res)));

    }

    update(entity: IPay): Observable<ResponseType> {
        return this.http
            .put<IPay>(this.resourceUrl + '/' + entity.id, entity, {observe: 'response'})
            .pipe(map((res: ResponseType) => this.convertDateFromServer(res)));
    }

    find(id: number): Observable<ResponseType> {
        return this.http
            .get<IPay>(`${this.resourceUrl}/${id}`, {observe: 'response'})
            .pipe(map((res: ResponseType) => this.convertDateFromServer(res)));
    }

    query(req?: any): Observable<ArrayResponseType> {
        const options = createRequestOption(req);
        // console.log("Pays Service . Query: ", req );
        return this.http
            .get<IPay[]>(this.resourceUrl, {params: options, observe: 'response'})
            .pipe(map((res: ArrayResponseType) => this.convertDateArrayFromServer(res)));
    }

    findForSale(saleId: number): Observable<ArrayResponseType> {
        return this.http
            .get<IPay[]>(`${this.saleUrl}/${saleId}/pays`, {observe: 'response'})
            .pipe(
                (map(
                    (res: ArrayResponseType) =>
                        this.convertDateArrayFromServer(res)
                ))
            );
    }

    delete(id: number): Observable<HttpResponse<{}>> {
        return this.http.delete(`${this.resourceUrl}/${id}`, {observe: 'response'});
    }

    protected convertDateFromServer(res: ResponseType): ResponseType {
        if (res.body) {
            res.body.pay_date = res.body.pay_date ? moment(res.body.pay_date) : undefined;
        }
        return res;
    }

    protected convertDateArrayFromServer(res: ArrayResponseType): ArrayResponseType {
        if (res.body) {
            res.body.forEach((pay: IPay) => {
                pay.pay_date = pay.pay_date ? moment(pay.pay_date) : undefined;
            });
        }
        return res;
    }


}
