import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import * as moment from 'moment';
import {environment} from '../../../../environments/environment';
import {createRequestOption} from '../../helpers/request-util';
import {IProvider} from '../../models/provider.model';

type ResponseType = HttpResponse<IProvider>;
type ArrayResponseType = HttpResponse<IProvider[]>;

@Injectable({providedIn: 'root'})
export class ProviderService {
    public resourceUrl = environment.apiURL + '/providers';

    constructor(protected http: HttpClient) {
    }

    create(provider: IProvider): Observable<ResponseType> {
        return this.http.post<IProvider>(this.resourceUrl, provider, {observe: 'response'})
            .pipe(map((res: ResponseType) => this.convertDateFromServer(res)));
    }

    update(provider: IProvider): Observable<ResponseType> {
        return this.http.put<IProvider>(`${this.resourceUrl}/${provider.id}`, provider, {observe: 'response'})
            .pipe(map((res: ResponseType) => this.convertDateFromServer(res)));
    }

    find(id: number): Observable<ResponseType> {
        return this.http.get<IProvider>(`${this.resourceUrl}/${id}`, {observe: 'response'})
            .pipe(map((res: ResponseType) => this.convertDateFromServer(res)));
    }

    query(req?: any): Observable<ArrayResponseType> {
        const options = createRequestOption(req);
        return this.http.get<IProvider[]>(this.resourceUrl, {params: options, observe: 'response'})
            .pipe(map((res: ArrayResponseType) => this.convertDateArrayFromServer(res)));
    }

    delete(id: number): Observable<HttpResponse<{}>> {
        return this.http.delete(`${this.resourceUrl}/${id}`, {observe: 'response'});
    }



    protected convertDateFromServer(res: ResponseType): ResponseType {
        if (res.body) {
            res.body.birthday = res.body.birthday ? moment(res.body.birthday) : null;
        }
        return res;
    }

    protected convertDateArrayFromServer(res: ArrayResponseType): ArrayResponseType {
        if (res.body) {
            res.body.forEach((instr: IProvider) => {
                instr.birthday = instr.birthday ? moment(instr.birthday) : null;
            });
        }
        return res;
    }
}
