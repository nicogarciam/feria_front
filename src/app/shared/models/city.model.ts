export interface ICity {
  id?: number;
  name?: string;
  province?: string;
  country?: string;
  lat?: number;
  long?: number;
}

export class City implements ICity {
  constructor(public id?: number, public name?: string, public province?: string, public country?: string) {}
}
