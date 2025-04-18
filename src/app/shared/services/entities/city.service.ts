import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import * as moment from 'moment';

import {environment} from '../../../../environments/environment';
import {createRequestOption} from '../../helpers/request-util';
import {DATE_FORMAT} from '../../constants/input.constants';
import {ICity} from '../../models/city.model';

type EntityResponseType = HttpResponse<ICity>;
type EntityArrayResponseType = HttpResponse<ICity[]>;

@Injectable({providedIn: 'root'})
export class CityService {
    public resourceUrl = environment.apiURL + '/cities';

    constructor(protected http: HttpClient) {
    }

    create(city: ICity): Observable<EntityResponseType> {
        return this.http.post<ICity>(this.resourceUrl, city, {observe: 'response'});
    }

    update(city: ICity): Observable<EntityResponseType> {
        return this.http.put<ICity>(this.resourceUrl, city, {observe: 'response'});
    }

    find(id: number): Observable<EntityResponseType> {
        return this.http.get<ICity>(`${this.resourceUrl}/${id}`, {observe: 'response'});
    }

    query(req?: any): Observable<EntityArrayResponseType> {
        const options = createRequestOption(req);
        return this.http.get<ICity[]>(this.resourceUrl, {params: options, observe: 'response'});
    }

    delete(id: number): Observable<HttpResponse<{}>> {
        return this.http.delete(`${this.resourceUrl}/${id}`, {observe: 'response'});
    }


}
