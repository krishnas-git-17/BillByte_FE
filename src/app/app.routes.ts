import { Routes } from '@angular/router';

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
      },
      {
        path: 'menu-items',
        loadComponent: () =>
          import('./pages/menu-items/menu-items/menu-items.component')
            .then(m => m.MenuItemsComponent)
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

    ]
  }
];
