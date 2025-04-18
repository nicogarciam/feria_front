export interface  IMarker {
  lat: number;
  lng: number;
  label?: string;
  draggable: boolean;
}

export interface ILocation {
  lat: number;
  lng: number;
  viewport?: Object;
  zoom: number;
  address?: string;
  full_address?: string;
  street_name?: string;
  street_number?: string;
  address_level_2?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;

  marker?: IMarker;
}

