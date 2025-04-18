import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import {Observable, Subscription} from 'rxjs';

@Injectable({
  providedIn: "root"
})
export class SearchService {
  public searchTerm: BehaviorSubject<string> = new BehaviorSubject<string>("");
  public searchTerm$: Observable<string> = this.searchTerm.asObservable();
  sub: Subscription;

  constructor() {}

  updateSearchTerm(term: string) {
    this.searchTerm.next(term);
  }

  getSearchTerm() {
    return this.searchTerm;
  }

}
