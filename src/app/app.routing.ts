import { Routes } from '@angular/router';
import { AdminLayoutComponent } from '@components/layouts/admin-layout/admin-layout.component';
import { AuthLayoutComponent } from '@components/layouts/auth-layout/auth-layout.component';
import { AuthGuard } from './shared/guards/auth.guard';

export const rootRouterConfig: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'home',
    redirectTo: 'sessions/signin',
    pathMatch: 'full'
  },
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'sessions',
        loadChildren: () => import('./views/sessions/sessions.module').then(m => m.SessionsModule),
        data: { title: 'Session'}
      }
    ]
  },
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./views/dashboard/dashboard.module').then(m => m.DashboardModule),
        data: { title: 'Dashboard'}
      },
      {
        path: 'store-config',
        loadChildren: () => import('./views/store-config/store-config.module').then(m => m.StoreConfigModule),
        data: { title: 'my.entity'}
      },
      {
        path: 'store-config/:tab',
        loadChildren: () => import('./views/store-config/store-config.module').then(m => m.StoreConfigModule),
        data: { title: 'my.entity'}
      },
      {
        path: 'products',
        loadChildren: () => import('./views/products/product.module').then(m => m.ProductModule),
        data: { title: 'products'}
      },
      {
        path: 'shop',
        loadChildren: () => import('./views/shop/shop.module').then(m => m.ShopModule),
        data: { title: 'Shop', breadcrumb: 'SHOP'}
      },
      {
        path: 'my-profile',
        loadChildren: () => import('./views/my-profile/my-profile.module').then(m => m.MyProfileModule),
        data: { title: 'my.profile'}
      },
      {
        path: 'pays',
        loadChildren: () => import('./views/pays/pay.module').then(m => m.PayModule),
        data: { title: 'pays'}
      },
      {
        path: 'sales',
        loadChildren: () => import('./views/sales/sale.module').then(m => m.SaleModule)
      },
      {
        path: 'customers',
        loadChildren: () => import('./views/customer/customer.module').then(m => m.CustomerModule)
      },
      {
        path: 'providers',
        loadChildren: () => import('./views/provider/provider.module').then(m => m.ProviderModule)
      }

    ]
  },
  {
    path: '**',
    redirectTo: 'sessions/404'
  }
];

