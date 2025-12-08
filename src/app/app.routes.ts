import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./layout/layout.component').then(m => m.LayoutComponent),
        children: [
            {
                path: 'dashboard',
                loadComponent: () =>
                    import('./pages/dining/dining.component').then(m => m.DiningComponent),
            },

            {
                path: 'orders/:tableId/:type',
                loadComponent: () =>
                    import('./pages/orders/orders.component').then(m => m.OrdersComponent),
            },


           {
  path: 'menu-items',
  loadComponent: () =>
    import('./pages/menu-items/menu-items/menu-items.component')
      .then(m => m.MenuItemsComponent)
}


        ]
    }
];

