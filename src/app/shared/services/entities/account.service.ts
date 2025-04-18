import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import * as moment from 'moment';

import {IAccount} from '../../models/account.model';
import {environment} from '../../../../environments/environment';
import {DATE_FORMAT} from '../../constants/input.constants';
import {createRequestOption} from '../../helpers/request-util';

type ResponseType = HttpResponse<IAccount>;
type ArrayResponseType = HttpResponse<IAccount[]>;

@Injectable({providedIn: 'root'})
export class AccountService {
    public resourceUrl = environment.apiURL + '/accounts';

    constructor(protected http: HttpClient) {
    }

    create(account: IAccount): Observable<ResponseType> {
        // console.log(account);
        return this.http
            .post<IAccount>(this.resourceUrl, account, {observe: 'response'})
            .pipe(map((res: ResponseType) => this.convertDateFromServer(res)));
    }

    register(account: IAccount): Observable<ResponseType> {
        return this.http
            .post<IAccount>(`${environment.apiURL}/auth/register`, account, {observe: 'response'})
            .pipe(map((res: ResponseType) => this.convertDateFromServer(res)));
    }


    update(account: IAccount): Observable<ResponseType> {
        // console.log(account);
        return this.http
            .put<IAccount>(this.resourceUrl + '/' + account.id, account, {observe: 'response'})
            .pipe(map((res: ResponseType) => this.convertDateFromServer(res)));
    }

    find(id: number): Observable<ResponseType> {
        return this.http
            .get<IAccount>(`${this.resourceUrl}/${id}`, {observe: 'response'})
            .pipe(map((res: ResponseType) => this.convertDateFromServer(res)));
    }

    myAccount() {
        return this.http
            .get<IAccount>(`${environment.apiURL}/my_account`, {observe: 'response'})
            .pipe(map((res: ResponseType) => this.convertDateFromServer(res)));
    }


    query(req?: any): Observable<ArrayResponseType> {
        const options = createRequestOption(req);
        return this.http
            .get<IAccount[]>(this.resourceUrl, {params: options, observe: 'response'})
            .pipe(map((res: ArrayResponseType) => this.convertDateArrayFromServer(res)));
    }

    delete(id: number): Observable<HttpResponse<{}>> {
        return this.http.delete(`${this.resourceUrl}/${id}`, {observe: 'response'});
    }

    protected convertDateFromServer(res: ResponseType): ResponseType {
        if (res.body) {
            res.body.birthday = res.body.birthday ? moment(res.body.birthday) : undefined;
        }
        return res;
    }

    protected convertDateArrayFromServer(res: ArrayResponseType): ArrayResponseType {
        if (res.body) {
            res.body.forEach((account: IAccount) => {
                account.birthday = account.birthday ? moment(account.birthday) : undefined;
            });
        }
        return res;
    }

    updateImage(member_logo: any): Observable<ResponseType> {
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'multipart/form-data');
        headers.append('Accept', 'application/json');
        return this.http.post<any>(`${this.resourceUrl}/upload_image`, member_logo, { observe: 'response', headers: headers });
    }

    validateEmail(email: any) {
        return this.http
            .post(`${environment.apiURL}/email/validate`, {email: email}, { observe: 'response'})
            .pipe(map((res: ArrayResponseType) => res));
    }


}
