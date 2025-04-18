export interface IImage {

  id?: number;
  title?: string;
  src?: string;
  primary?: boolean;
  state?: string;
  benefit_id?: number,
  entity_id?: number,
  activity_id?: number,
  event_id?: number,

}

export class Image implements IImage {
  constructor(o?: Partial<IImage>) {
    Object.assign(this, o);
  }
}
