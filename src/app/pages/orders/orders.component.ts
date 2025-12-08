import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '../../shared/age-header/page-header.component';
import { MenuListComponent, MenuItem } from '../../layout/components/menu-list/menu-list.component';
import { TableStatusService } from '../../services/table-status.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, MenuListComponent],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss'
})
export class OrdersComponent implements AfterViewInit {

  @ViewChild(MenuListComponent)
  menuList!: MenuListComponent;

  tableId = '';
  tableType = '';

  cart: { [id: number]: MenuItem & { qty: number } } = {};
  quantities: { [id: number]: number } = {};

  orderType: 'Dine' | 'Parcel' | 'Delivery' = 'Dine';

  subtotal = 0;
  tax = 0;
  total = 0;

  isOccupied = false;

  constructor(
    private route: ActivatedRoute,
    private tableStatus: TableStatusService
  ) {
    this.tableId = this.route.snapshot.params['tableId'];
    this.tableType = this.route.snapshot.params['type'];

    // Load table status
    this.isOccupied = this.tableStatus.getStatus(this.tableId) === 'occupied';

    // Load previous saved order
    const saved = this.tableStatus.loadOrder(this.tableId);
    if (saved) {
      this.cart = saved.items || {};
      this.quantities = saved.quantities || {};
      this.subtotal = saved.subtotal || 0;
      this.tax = saved.tax || 0;
      this.total = saved.total || 0;
      this.isOccupied = saved.occupied ?? this.isOccupied;
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.menuList) {
        this.menuList.quantities = { ...this.quantities };
      }
    });
  }

  // ----------------- MAIN QUANTITY CHANGE -----------------
  onQuantityChange(ev: { item: MenuItem; qty: number }) {
    const { item, qty } = ev;

    if (qty === 0) {
      delete this.cart[item.id];
    } else {
      this.cart[item.id] = { ...item, qty };
    }

    // replace quantities object (IMPORTANT FIX)
    this.quantities = { ...this.quantities, [item.id]: qty };

    this.calculateTotals();
    this.saveOrder();
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
    const items = Object.values(this.cart);
    this.subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    this.tax = Math.round(this.subtotal * 0.05);
    this.total = this.subtotal + this.tax;
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

  // ------------- PROCEED BUTTON -------------
  onProceedClick() {
    if (this.orderType !== 'Dine') return;

    if (!this.isOccupied) {
      this.isOccupied = true;
      this.tableStatus.setStatus(this.tableId, 'occupied');
      this.tableStatus.startTimer(this.tableId);
      this.saveOrder();
    } else {
      this.isOccupied = false;
      this.tableStatus.setStatus(this.tableId, 'available');
      this.tableStatus.stopTimer(this.tableId);

      // CLEAR ORDER
      this.cart = {};
      this.quantities = {};
      this.subtotal = this.tax = this.total = 0;

      if (this.menuList) {
        this.menuList.quantities = {};
      }

      this.tableStatus.clearOrder(this.tableId);
    }
  }

  get proceedLabel() {
    return this.isOccupied ? 'Complete Order' : 'Proceed';
  }
}
