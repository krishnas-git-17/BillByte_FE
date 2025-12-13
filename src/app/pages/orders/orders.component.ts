import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MenuListComponent, MenuItem } from '../../layout/components/menu-list/menu-list.component';
import { TableStatusService } from '../../services/table-status.service';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
@Component({
    selector: 'app-orders',
    standalone: true,
    imports: [CommonModule, MenuListComponent, FormsModule, MatIconModule],
    templateUrl: './orders.component.html',
    styleUrl: './orders.component.scss'
})

export class OrdersComponent implements AfterViewInit {


    @ViewChild(MenuListComponent)
    menuList!: MenuListComponent;

    tableId = '';
    tableType = '';
    searchText: string = "";
    cart: { [id: number]: MenuItem & { qty: number } } = {};
    quantities: { [id: number]: number } = {};
    isCheckoutMode = false;
    orderType: 'Dine' | 'Parcel' | 'Delivery' = 'Dine';
    discountPercent: number = 0;
    discountAmount: number = 0;

    subtotal = 0;
    tax = 0;
    total = 0;

    isOccupied = false;

    

    constructor(
        private location: Location,
        private route: ActivatedRoute,
        private tableStatus: TableStatusService
    ) {
         window.onbeforeunload = () => {
      if (this.cartCount > 0 && !this.isOccupied) {
        return "Unsaved order will be lost. Continue?";
      }
      return null;
    };
        this.isOccupied = false;
    this.isCheckoutMode = false;

        this.tableId = this.route.snapshot.params['tableId'];
        this.tableType = this.route.snapshot.params['type'];

        this.isOccupied = this.tableStatus.getStatus(this.tableId) === 'occupied';
        const saved = this.tableStatus.loadOrder(this.tableId);
        if (saved) {
            this.cart = saved.items || {};
            this.quantities = saved.quantities || {};
            this.subtotal = saved.subtotal || 0;
            this.tax = saved.tax || 0;
            this.total = saved.total || 0;
            this.isOccupied = saved.occupied ?? this.isOccupied;
            this.isCheckoutMode = this.isOccupied;
        }
    }

 goBack() {
  if (this.cartCount > 0 && !this.isOccupied) {
    const confirmLeave = confirm(
      "You have unsaved items. If you go back, the order will be cleared. Proceed?"
    );

    if (!confirmLeave) return;

    // Clear items
    this.cart = {};
    this.quantities = {};
    this.tableStatus.clearOrder(this.tableId);
  }

  this.location.back();
}



    filterMenu(text: string) {
        this.searchText = text;
        this.menuList.searchText = text;
        this.menuList.applyFilters();
    }


    ngAfterViewInit() {
        setTimeout(() => {
            if (this.menuList) {
                this.menuList.quantities = { ...this.quantities };
            }
        });
    }

    onQuantityChange(ev: { item: MenuItem; qty: number }) {
        const { item, qty } = ev;

        if (qty === 0) {
            delete this.cart[item.id];
        } else {
            this.cart[item.id] = { ...item, qty };
        }

        this.quantities = { ...this.quantities, [item.id]: qty };

        this.calculateTotals();
        this.saveOrder();
    }

    increaseQty(item: any) {
        const updatedQty = (this.quantities[item.id] || 0) + 1;
        this.onQuantityChange({ item, qty: updatedQty });
    }

    decreaseQty(item: any) {
        const updatedQty = (this.quantities[item.id] || 0) - 1;

        if (updatedQty <= 0) {
            this.removeFromCart(item.id); // auto-remove item
            return;
        }

        this.onQuantityChange({ item, qty: updatedQty });
    }


    removeFromCart(id: number) {
        delete this.cart[id];

        this.quantities = { ...this.quantities, [id]: 0 };

        if (this.menuList) {
            this.menuList.resetQuantity(id);
        }

        this.calculateTotals();
        this.saveOrder();
    }

    calculateTotals() {
        this.subtotal = Object.values(this.cart).reduce((sum: any, item: any) =>
            sum + item.price * item.qty, 0);

        this.discountAmount = this.subtotal * (this.discountPercent / 100);

        const afterDiscount = this.subtotal - this.discountAmount;

        this.tax = Math.round(afterDiscount * 0.05);   // 5% tax

        this.total = afterDiscount + this.tax;
}


    saveOrder() {
        this.tableStatus.saveOrder(this.tableId, {
            items: this.cart,
            quantities: this.quantities,
            subtotal: this.subtotal,
            tax: this.tax,
            total: this.total,
            occupied: this.isOccupied
        });
    }

  onProceedClick() {

  // FIRST CLICK → LOCK TABLE + SHOW CHECKOUT BUTTON
  if (!this.isOccupied && !this.isCheckoutMode) {

    this.isOccupied = true;
    this.isCheckoutMode = true;   // show checkout button

    this.tableStatus.setStatus(this.tableId, 'occupied');
    this.tableStatus.startTimer(this.tableId);
    this.saveOrder();

    return;   // STOP HERE — do NOT complete order
  }

  // IF IN CHECKOUT MODE → DO NOT COMPLETE ORDER YET
  if (this.isCheckoutMode) {
    return;   // wait for checkout() click
  }

  // FINAL: COMPLETE ORDER
  this.completeOrder();
}

    checkout() {
  const orderData = {
    tableId: this.tableId,
    items: this.cart,
    subtotal: this.subtotal,
    tax: this.tax,
    discount: this.discountPercent,
    total: this.total,
    orderType: this.orderType,
    timestamp: new Date().toISOString()
  };

  // Save completed order
  const existing = JSON.parse(localStorage.getItem("completedOrders") || "[]");
  existing.push(orderData);
  localStorage.setItem("completedOrders", JSON.stringify(existing));

  // Clear table
  this.completeOrder();
}

completeOrder() {
  this.isOccupied = false;
  this.isCheckoutMode = false;

  this.tableStatus.setStatus(this.tableId, 'available');
  this.tableStatus.stopTimer(this.tableId);

  this.cart = {};
  this.quantities = {};
  this.subtotal = this.tax = this.total = 0;
  this.discountPercent = 0;

  if (this.menuList) this.menuList.applyFilters();

  this.tableStatus.clearOrder(this.tableId);
}



    get proceedLabel() {
        return this.isOccupied ? 'Complete Order' : 'Proceed';
    }
    get cartCount(): number {
        return this.cart ? Object.keys(this.cart).length : 0;
    }

}
