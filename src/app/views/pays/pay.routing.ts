import {Routes} from '@angular/router';
import {PayCrudComponent} from './pay-crud.component';

export const PaysRoutes: Routes = [
  {
    path: '',
    component: PayCrudComponent,
    data: { title: 'Pays', breadcrumb: 'Pays' }
  }

];
