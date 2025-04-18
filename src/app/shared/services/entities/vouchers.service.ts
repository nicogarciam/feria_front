import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import * as moment from 'moment';
import {environment} from '../../../../environments/environment';
import {createRequestOption} from '../../helpers/request-util';
import {IVoucher, Voucher} from '../../models/voucher.model';

type EntityResponseType = HttpResponse<IVoucher>;
type EntityArrayResponseType = HttpResponse<IVoucher[]>;

@Injectable({providedIn: 'root'})
export class VoucherService {
    public resourceUrl = environment.apiURL + '/vouchers';

    constructor(protected http: HttpClient) {
    }

    create(entity: IVoucher): Observable<EntityResponseType> {
        const copy = this.convertDataFromClient(entity);
        return this.http
            .post<IVoucher>(this.resourceUrl, copy, {observe: 'response'})
            .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
    }
    

    update(entity: IVoucher): Observable<EntityResponseType> {
        // const copy = this.convertDateFromClient(membership);
        return this.http
            .put<IVoucher>(this.resourceUrl + '/' + entity.id, entity, {observe: 'response'})
            .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
    }

    activateMembership(id: number): Observable<EntityResponseType> {
        return this.http
            .put<IVoucher>(environment.apiURL + '/member/activate', {"id": id}, {observe: 'response'})
            .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
    }


    find(id: number): Observable<EntityResponseType> {
        return this.http
            .get<IVoucher>(`${this.resourceUrl}/${id}`, {observe: 'response'})
            .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
    }

    query(req?: any): Observable<EntityArrayResponseType> {
        const options = createRequestOption(req);
        return this.http
            .get<IVoucher[]>(this.resourceUrl, {params: options, observe: 'response'})
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
            res.body.date_start = res.body.date_start ? moment(res.body.date_start) : null;
            res.body.date_end = res.body.date_end ? moment(res.body.date_end) : null;
        }
        return res;
    }

    protected convertDateArrayFromServer(res: EntityArrayResponseType): EntityArrayResponseType {
        if (res.body) {
            res.body.forEach((membership: IVoucher) => {
                membership.date_start = membership.date_start ? moment(membership.date_start) : null;
                membership.date_end = membership.date_end ? moment(membership.date_end) : null;
            });
        }
        return res;
    }



    protected convertDataFromClient(ent: IVoucher): IVoucher {
        return new Voucher({...ent,
            customer_used_id: ent.customer.id, entity: ""}
        );

    }



}
