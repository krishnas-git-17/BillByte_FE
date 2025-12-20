import { Routes } from '@angular/router';
import { UnsavedOrderGuard } from './pages/orders/unsaved-order.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/layout.component').then(m => m.LayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dining/dining.component').then(m => m.DiningComponent),
      },
      {
        path: 'dashboard/orders/:tableId/:type',
        loadComponent: () =>
          import('./pages/orders/orders.component').then(m => m.OrdersComponent),
         canDeactivate: [UnsavedOrderGuard]
      },
      {
        path: 'menu-items',
        loadComponent: () =>
          import('./pages/menu-items/menu-items/menu-items.component')
            .then(m => m.MenuItemsComponent)
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./pages/reports/reports.component')
            .then(m => m.ReportsComponent)
      },


      {
        path: 'settings',
        loadComponent: () =>
          import('./pages/settings/settings.component').then(m => m.SettingsComponent),
       
      },
        {
        path: 'settings/menu-images',
        loadComponent: () =>
           import('./pages/menu-items/menu-images.component')
                .then(m => m.MenuImagesComponent)
      },
      {
        path: 'settings/table-preferences',
        loadComponent: () =>
           import('./pages/TablePreference/table-preference.component')
                .then(m => m.TablePreferenceComponent)
      },

    ]
  }
];
