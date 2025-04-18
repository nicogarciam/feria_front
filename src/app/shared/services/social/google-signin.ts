import {Injectable} from '@angular/core';
import {environment} from "../../../../environments/environment";
import {Observable, ReplaySubject} from "rxjs";

declare var google: any;

@Injectable({providedIn: 'root'})
export class GoogleSigninService {
    private oauth2: gapi.auth2.GoogleAuth;
    private subject = new ReplaySubject<gapi.auth2.GoogleUser>(1);

    constructor() {
        gapi.load('auth2', () => {
            this.oauth2 = gapi.auth2.init({
                    client_id: environment.googleClientId
                })
        })
    }

    public  signin() {
        this.oauth2.signIn({
            scope: 'https:'
        })
            .then (user => {
                this.subject.next(user);
                console.log(user)
        })
            .catch( (reason) => {
                console.log(reason);
                this.subject.next(null);
            });
    }

    public signout() {
        this.oauth2.signOut()
            .then(() => {
                this.subject.next(null);
            });
    }

    public observable(): Observable<gapi.auth2.GoogleUser> {
        return this.subject.asObservable();
    }
    
}
