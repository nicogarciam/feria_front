export interface ISchedule {

  id?: number;
  day_short?: string;
  day_name?: string;
  hour_in?: string;
  hour_end?: string;
  active?: boolean;

}

export class Schedule implements ISchedule {
  constructor(o?: Partial<Schedule>) {
    Object.assign(this, o);
  }
}
