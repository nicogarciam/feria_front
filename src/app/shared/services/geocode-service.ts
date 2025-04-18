import {Injectable} from '@angular/core';
import {MapsAPILoader} from '@agm/core';
import {Observable} from 'rxjs/Observable';
import {of} from 'rxjs/observable/of';
import {map, switchMap, tap} from 'rxjs/operators';
import {fromPromise} from 'rxjs/observable/fromPromise';
import {ILocation} from '../models/geocoding.model';

declare var google: any;

@Injectable()
export class GeocodeService {
    private geocoder: any;

    locations = [];

    public location: ILocation = {
        lat: 51.678418,
        lng: 7.809007,
        marker: {
            lat: 51.678418,
            lng: 7.809007,
            draggable: true
        },
        zoom: 17
    };

    constructor(private mapLoader: MapsAPILoader) {
    }

    private initGeocoder() {
        console.log('Init geocoder!');
        this.geocoder = new google.maps.Geocoder();
    }

    private setCurrentLocation(): ILocation | null {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                this.location.lat = position.coords.latitude;
                this.location.lng = position.coords.longitude;
                this.location.zoom = 15;
                return this.location;
            });
        } else {
            return null;
        }
    }

    private waitForMapsToLoad(): Observable<boolean> {
        if (!this.geocoder) {
            return fromPromise(this.mapLoader.load())
                .pipe(
                    tap(() => this.initGeocoder()),
                    map(() => true)
                );
        }
        return of(true);
    }

    geocodeAddress(location: string): Observable<ILocation> {
        console.log('Start geocoding!');
        // @ts-ignore
        return this.waitForMapsToLoad().pipe(
            switchMap(() => {
                return new Observable(observer => {
                    this.geocoder.geocode({'address': location}, (results, status) => {
                        if (status === google.maps.GeocoderStatus.OK) {
                            console.log('Geocoding complete!');
                            observer.next({
                                lat: results[0].geometry.location.lat(),
                                lng: results[0].geometry.location.lng()
                            });
                        } else {
                            console.log('Error - ', results, ' & Status - ', status);
                            observer.next({lat: 0, lng: 0});
                        }
                        observer.complete();
                    });
                })
            })
        );
    }


    findLocation(address): ILocation {
        if (!this.geocoder) {
            this.geocoder = new google.maps.Geocoder()
        }
        return this.geocoder.geocode({
            'address': address
        }, (results, status) => {
            console.log(results);
            if (status === google.maps.GeocoderStatus.OK) {
                return this.decomposeAddressComponents(results);
            } else {
                return null;
            }
        })

    }

    markerDragEnd(m: any, $event: any) {
        this.location.marker.lat = m.coords.lat;
        this.location.marker.lng = m.coords.lng;
        this.findAddressByCoordinates();
    }

    findAddressByCoordinates() {
        this.geocoder.geocode({
            'location': {
                lat: this.location.marker.lat,
                lng: this.location.marker.lng
            }
        }, (results, status) => {
            this.decomposeAddressComponents(results);
        })
    }

    decomposeAddressComponents(googleAddress): ILocation {
        if (googleAddress.length === 0) {
            return null;
        }
        const address = googleAddress.address_components;
        this.location.full_address = googleAddress.formatted_address;
        this.location.marker.lat = googleAddress.geometry.location.lat();
        this.location.marker.lng = googleAddress.geometry.location.lng();
        for (const element of address) {
            if (element.length === 0 && !element['types']) {
                continue
            }
            if (element['types'].indexOf('street_number') > -1) {
                this.location.street_number = element['long_name'];
                continue;
            }
            if (element['types'].indexOf('route') > -1) {
                this.location.street_name = element['long_name'];
                continue;
            }
            if (element['types'].indexOf('administrative_area_level_2') > -1) {
                this.location.address_level_2 = element['long_name'];
                continue;
            }
            if (element['types'].indexOf('locality') > -1) {
                this.location.city = element['long_name'];
                continue;
            }
            if (element['types'].indexOf('administrative_area_level_1') > -1) {
                this.location.state = element['long_name'];
                continue;
            }
            if (element['types'].indexOf('country') > -1) {
                this.location.country = element['long_name'];
                continue;
            }
            if (element['types'].indexOf('postal_code') > -1) {
                this.location.postal_code = element['long_name'];
                continue;
            }
        }

        this.location.address = this.location.street_name + ' ' + this.location.street_number;

        return this.location;
    }
}


export interface GoogleAddress {
    id?: string;
    gmID?: string;
    placeID?: string;
    name?: string;
    icon?: string;
    displayAddress?: string;
    postalCode?: number;
    streetNumber?: string;
    streetName?: string;
    sublocality?: string;
    locality?: {
        short?: string;
        long?: string;
    };
    state?: {
        short?: string;
        long?: string;
    };
    country?: {
        short?: string;
        long?: string;
    };
    vicinity?: string;
    url?: string;
    geoLocation?: GoogleLocation;
}

export interface GoogleLocation {
    latitude: number;
    longitude: number;
}
