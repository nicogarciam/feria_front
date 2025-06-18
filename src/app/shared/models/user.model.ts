import {IAccount} from './account.model';

export interface IUser {
  id?: number;
  displayName?: string;
  roles?: string[];
  name?: string;
  email?: string;
  account?: IAccount;
  logins?: number;
}

export class User implements IUser {

  constructor(
      public id?: number,
      public displayName?: string,
      public roles?: string[],
      public name?: string,
      public email?: string,
      public account?: IAccount,
      public logins?: number,

  ) {
    this.displayName = this.name;
  }
}
