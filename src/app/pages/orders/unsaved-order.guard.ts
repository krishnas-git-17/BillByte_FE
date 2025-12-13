import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { OrdersComponent } from './orders.component';

@Injectable({ providedIn: 'root' })
export class UnsavedOrderGuard implements CanDeactivate<OrdersComponent> {

  canDeactivate(component: OrdersComponent): boolean {
    // If no items → allow navigation
    if (component.cartCount === 0) return true;

    // If order already saved (occupied) → allow
    if (component.isOccupied) return true;

    // Show warning popup
    return confirm("You have unsaved items in the order. Going back will remove them. Proceed?");
  }
}
