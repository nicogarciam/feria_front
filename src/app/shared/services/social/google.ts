import {Injectable} from '@angular/core';
import {environment} from "../../../../environments/environment";
import {BehaviorSubject, Observable, ReplaySubject} from "rxjs";
import {HttpClient, HttpHeaders} from "@angular/common/http";

declare var google: any;

@Injectable({providedIn: 'root'})
export class GoogleService {
    private username = new BehaviorSubject<string>(localStorage.getItem('username')!)
    private path = environment.apiURL

    constructor(private httpClient: HttpClient) {
    }


}
