import { IPermission, Permission } from './permission.model';

export interface IRole {
  id?: number;
  name?: string;
  permissions?: IPermission[];
}

export class Role implements IRole {
  constructor(
    public id?: number,
    public name?: string,
    public permissions?: Permission[],
  ) {}
}
