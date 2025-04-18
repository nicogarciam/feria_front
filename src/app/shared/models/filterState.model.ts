export interface IFilterState {
  id?: number;
  name?: string;
  cant?: number;
  selected?: boolean;
}

export class FilterState implements IFilterState {
  constructor(o?: Partial<FilterState>) {
    Object.assign(this, o);
  }
}
