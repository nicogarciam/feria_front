import {Routes} from '@angular/router';
import {StoreConfigComponent} from './store-config.component';

export const HotelConfigRoutes: Routes = [
    {
        path: "",
        component: StoreConfigComponent,
        data: {title: 'Settings', tab: 'settings' }
    },
    {
        path: "/:tab",
        component: StoreConfigComponent,
        data: {title: 'Settings', tab: 'products' }
    }
];
