import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {environment} from '../../../../environments/environment';
import {createRequestOption} from '../../helpers/request-util';
import {ICustomer} from "../../models/customer.model";

type ResponseType = HttpResponse<ICustomer>;
type ArrayResponseType = HttpResponse<ICustomer[]>;

@Injectable({providedIn: 'root'})
export class CustomerService {
    public resourceUrl = environment.apiURL + '/customers';

    constructor(protected http: HttpClient) {
    }

    create(entity: ICustomer): Observable<ResponseType> {
        // console.log(account);
        return this.http
            .post<ICustomer>(this.resourceUrl, entity, {observe: 'response'})
            .pipe(map((res: ResponseType) => this.convertDateFromServer(res)));
    }

    register(entity: ICustomer): Observable<ResponseType> {
        return this.http
            .post<ICustomer>(`${environment.apiURL}/register`, entity, {observe: 'response'})
            .pipe(map((res: ResponseType) => this.convertDateFromServer(res)));
    }


    update(entity: ICustomer): Observable<ResponseType> {
        // console.log(account);
        return this.http
            .put<ICustomer>(this.resourceUrl + '/' + entity.id, entity, {observe: 'response'})
            .pipe(map((res: ResponseType) => this.convertDateFromServer(res)));
    }

    find(id: number): Observable<ResponseType> {
        return this.http
            .get<ICustomer>(`${this.resourceUrl}/${id}`, {observe: 'response'})
            .pipe(map((res: ResponseType) => this.convertDateFromServer(res)));
    }

    myAccount() {
        return this.http
            .get<ICustomer>(`${environment.apiURL}/my_account`, {observe: 'response'})
            .pipe(map((res: ResponseType) => this.convertDateFromServer(res)));
    }


    query(req?: any): Observable<ArrayResponseType> {
        const options = createRequestOption(req);
        return this.http
            .get<ICustomer[]>(this.resourceUrl, {params: options, observe: 'response'})
            .pipe(map((res: ArrayResponseType) => this.convertDateArrayFromServer(res)));
    }

    delete(id: number): Observable<HttpResponse<{}>> {
        return this.http.delete(`${this.resourceUrl}/${id}`, {observe: 'response'});
    }

    protected convertDateFromServer(res: ResponseType): ResponseType {
        // if (res.body) {
        //     res.body.birthday = res.body.birthday ? moment(res.body.birthday) : undefined;
        // }
        return res;
    }

    protected convertDateArrayFromServer(res: ArrayResponseType): ArrayResponseType {
        // if (res.body) {
        //     res.body.forEach((entity: ICustomer) => {
        //         entity.birthday = entity.birthday ? moment(entity.birthday) : undefined;
        //     });
        // }
        return res;
    }

    updateImage(customer_photo: any): Observable<ResponseType> {
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'multipart/form-data');
        headers.append('Accept', 'application/json');
        return this.http.post<any>(`${this.resourceUrl}/upload_image`, customer_photo, { observe: 'response', headers: headers });
    }

    validateEmail(email: any) {
        return this.http
            .post(`${environment.apiURL}/email/validate`, {email: email}, { observe: 'response'})
            .pipe(map((res: ArrayResponseType) => res));
    }


}
