import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from 'environments/environment';
import {createRequestOption} from '../../../shared/helpers/request-util';
import {ICategory} from "@models/category.model";

type EntityResponseType = HttpResponse<ICategory>;
type EntityArrayResponseType = HttpResponse<ICategory[]>;

@Injectable({providedIn: 'root'})
export class CategoryService {
    public resourceUrl = environment.apiURL + '/categories';

    constructor(protected http: HttpClient) {
    }

    create(category: ICategory): Observable<EntityResponseType> {
        // const copy = this.convertDateFromClient(accommodationType);
        console.log('accommodationTypeService', category);
        return this.http
            .post<ICategory>(this.resourceUrl, category, {observe: 'response'});
    }

    update(category: ICategory): Observable<EntityResponseType> {
        // const copy = this.convertDateFromClient(accommodationType);
        return this.http
            .put<ICategory>(this.resourceUrl + '/' + category.id, category, {observe: 'response'});
    }

    find(id: number): Observable<EntityResponseType> {
        return this.http
            .get<ICategory>(`${this.resourceUrl}/${id}`, {observe: 'response'});
    }

    query(req?: any): Observable<EntityArrayResponseType> {
        const options = createRequestOption(req);
        return this.http
            .get<ICategory[]>(this.resourceUrl, {params: options, observe: 'response'});
    }

    findByStore(entityId?: any): Observable<EntityArrayResponseType> {

        const url = entityId ?
            `${environment.apiURL}/store/${entityId}/categories` :
            `${environment.apiURL}/categories`;

        return this.http
            .get<ICategory[]>( url, {observe: 'response'});
    }


    delete(id: number): Observable<HttpResponse<{}>> {
        return this.http.delete(`${this.resourceUrl}/${id}`, {observe: 'response'});
    }



}
