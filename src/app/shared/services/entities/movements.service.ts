import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import * as moment from 'moment';
import {environment} from '../../../../environments/environment';
import {createRequestOption} from '../../helpers/request-util';
import {IMovement} from '../../models/movement.model';
import {IBalance} from "../../models/balance.model";

type ResponseType = HttpResponse<IMovement>;
type ArrayResponseType = HttpResponse<IMovement[]>;

@Injectable({providedIn: 'root'})
export class MovementsService {
    public resourceUrl = environment.apiURL + '/movements';
    public accountUrl = environment.apiURL + '/accounts';

    constructor(protected http: HttpClient) {
    }

    create(entity: IMovement): Observable<ResponseType> {
        return this.http
            .post<IMovement>(this.resourceUrl, entity, {observe: 'response'})
            .pipe(map((res: ResponseType) => this.convertDateFromServer(res)));
    }

    update(entity: IMovement): Observable<ResponseType> {
        return this.http
            .put<IMovement>(this.resourceUrl + '/' + entity.id, entity, {observe: 'response'})
            .pipe(map((res: ResponseType) => this.convertDateFromServer(res)));
    }

    find(id: number): Observable<ResponseType> {
        return this.http
            .get<IMovement>(`${this.resourceUrl}/${id}`, {observe: 'response'})
            .pipe(map((res: ResponseType) => this.convertDateFromServer(res)));
    }

    query(req?: any): Observable<ArrayResponseType> {
        const options = createRequestOption(req);
        return this.http
            .get<IMovement[]>(this.resourceUrl, {params: options, observe: 'response'})
            .pipe(map((res: ArrayResponseType) => this.convertDateArrayFromServer(res)));
    }

    queryBalance(req?: any): Observable<HttpResponse<IBalance>> {
        return this.http
            .post<IBalance>(`${this.accountUrl}/balance`, req, {observe: 'response'})
            .pipe(map((res: HttpResponse<IBalance>) => this.convertBalanceDateFromServer(res)));
    }

    delete(id: number): Observable<HttpResponse<{}>> {
        return this.http.delete(`${this.resourceUrl}/${id}`, {observe: 'response'});
    }

    protected convertDateFromServer(res: ResponseType): ResponseType {
        if (res.body) {
            res.body.date = res.body.date ? moment(res.body.date) : undefined;
        }
        return res;
    }

    protected convertDateArrayFromServer(res: ArrayResponseType): ArrayResponseType {
        if (res.body) {
            res.body.forEach((re: IMovement) => {
                re.date = re.date ? moment(re.date) : undefined;
            });
        }
        return res;
    }

    private convertBalanceDateFromServer(res: HttpResponse<IBalance>) {
        if (res.body) {
            res.body.date_from =  res.body.date_from ? moment( res.body.date_from) : undefined;
            res.body.date_to =  res.body.date_to ? moment( res.body.date_to) : undefined;
            if  (res.body.movements) {
                res.body.movements.forEach((re: IMovement) => {
                    re.date = re.date ? moment(re.date) : undefined;
                });
            }
        }
        return res;
    }
}
