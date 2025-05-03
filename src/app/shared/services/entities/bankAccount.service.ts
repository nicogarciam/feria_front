import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import * as moment from 'moment';
import {environment} from '../../../../environments/environment';
import {createRequestOption} from '../../helpers/request-util';
import {IBankAccount} from "../../models/bankAccount.model";

type ResponseType = HttpResponse<IBankAccount>;
type ArrayResponseType = HttpResponse<IBankAccount[]>;

@Injectable({providedIn: 'root'})
export class BankAccountService {
    public resourceUrl = environment.apiURL + '/bank_accounts';

    constructor(protected http: HttpClient) {
    }

    create(entity: IBankAccount): Observable<ResponseType> {
        return this.http
            .post<IBankAccount>(this.resourceUrl, entity, {observe: 'response'})
            .pipe(map((res: ResponseType) => res));
    }


    update(entity: IBankAccount): Observable<ResponseType> {
        return this.http
            .put<IBankAccount>(this.resourceUrl + '/' + entity.id, entity, {observe: 'response'})
            .pipe(map((res: ResponseType) => res));
    }

    find(id: number): Observable<ResponseType> {
        return this.http
            .get<IBankAccount>(`${this.resourceUrl}/${id}`, {observe: 'response'})
            .pipe(map((res: ResponseType) => res));
    }

    query(req?: any): Observable<ArrayResponseType> {
        const options = createRequestOption(req);
        return this.http
            .get<IBankAccount[]>(this.resourceUrl, {params: options, observe: 'response'})
            .pipe(map((res: ArrayResponseType) => res));
    }

    delete(id: number): Observable<HttpResponse<{}>> {
        return this.http.delete(`${this.resourceUrl}/${id}`, {observe: 'response'});
    }


}
