import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import { Observable } from 'rxjs';

import {environment} from '@environments/environment';
import {Store, IStore} from '@models/store.model';
import {createRequestOption} from '@helpers/request-util';
import {ISale} from "@models/sale.model";
import {map} from "rxjs/operators";
import {ISaleState} from "@models/saleState.model";

type EntityResponseType = HttpResponse<IStore>;
type EntityArrayResponseType = HttpResponse<IStore[]>;

@Injectable({ providedIn: 'root' })
export class StoreService {
  public resourceUrl = environment.apiURL + '/stores';

  constructor(protected http: HttpClient) {}

  create(entity: IStore): Observable<EntityResponseType> {
    return this.http.post<IStore>(this.resourceUrl, entity, { observe: 'response' });
  }

  update(entity: IStore): Observable<EntityResponseType> {
    return this.http.put<IStore>(this.resourceUrl + '/' + entity.id, entity, { observe: 'response' });
  }

  find(id?: number): Observable<EntityResponseType> {
    return this.http.get<IStore>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  myStores(): Observable<EntityArrayResponseType> {
    return this.http.get<IStore[]>(`${environment.apiURL}/my_stores`, { observe: 'response' });
  }

  selectStore(ent: IStore): Observable<EntityResponseType> {
    return this.http.get<IStore>(`${this.resourceUrl}/select/${ent.id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IStore[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  updateLogo(entity_logo: any): Observable<EntityResponseType> {
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'multipart/form-data');
    headers.append('Accept', 'application/json');
    return this.http.post<any>(`${this.resourceUrl}/upload_logo`, entity_logo, { observe: 'response', headers: headers });
  }


  protected convertToServer(ent: IStore): IStore {
    return new Store({...ent,
      city_id: ent.city?.id, city: ""});
  }

  // BOOKING STATES

  findSaleStates(entityId: number): Observable<HttpResponse<ISaleState[]>> {
    return this.http
        .get<ISaleState[]>(`${this.resourceUrl}/${entityId}/booking_states`, {observe: 'response'})
        .pipe(map((res: HttpResponse<ISaleState[]>) => res));
  }


}
