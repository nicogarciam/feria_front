import { SessionStore } from './session.store';

export class SessionService {
    constructor(private sessionStore: SessionStore) {}

    updateUserName(newName: string) {
        this.sessionStore.update(state => ({
            name: newName
        }));
    }
}
