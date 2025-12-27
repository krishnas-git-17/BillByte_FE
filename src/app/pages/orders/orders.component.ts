import { Component, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MenuListComponent, MenuItem } from '../../layout/components/menu-list/menu-list.component';
import { TableStatusService } from '../../services/table-status.service';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { CheckoutComponent } from '../../layout/components/checkout/checkout.component';
import { CompletedOrdersService } from '../../services/completed-orders.service';
import { ActiveOrdersService } from '../../services/active-orders.service';
import { ReceiptComponent } from '../../receipt/receipt.component';
import html2pdf from 'html2pdf.js';
import { Router } from '@angular/router';
@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, MenuListComponent, FormsModule, MatIconModule, CheckoutComponent, ReceiptComponent],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss'
})

export class OrdersComponent implements AfterViewInit {
  @ViewChild(MenuListComponent, { static: false })
  menuList!: MenuListComponent;
  loadingOrders = true
  tableId = '';
  tableType = '';
  searchText: string = "";
  cart: { [id: number]: MenuItem & { qty: number } } = {};
  quantities: { [id: number]: number } = {};
  isCheckoutMode = false;
  orderType: 'Dine' | 'Parcel' | 'Delivery' = 'Dine';
  receiptData: any;
  receiptMode: 'KOT' | 'BILL' = 'KOT';
  discountPercent: number = 0;
  discountAmount: number = 0;
  isSubmitting = false;
  subtotal = 0;
  tax = 0;
  total = 0;
  isOccupied = false;
  private isRestoring = true;
  private buildOrderData() {
    return {
      tableId: this.tableId,
      orderType: this.orderType,
      total: this.total,
      createdAt: new Date(),
      items: Object.values(this.cart).map(i => ({
        itemName: i.name,
        qty: i.qty
      }))
    };
  }

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private tableStatus: TableStatusService,
    private completedOrders: CompletedOrdersService,
    private cdr: ChangeDetectorRef,
    private activeOrders: ActiveOrdersService,
    private router: Router
  ) {
    this.isOccupied = false;
    this.isCheckoutMode = false;
    this.tableId = this.route.snapshot.params['tableId'];
    this.tableType = this.route.snapshot.params['type'];
    this.isOccupied = false;
  }

  goBack() {
    if (this.cartCount === 0) {

      this.tableStatus.resetTable(this.tableId).subscribe({
        next: () => this.location.back(),
        error: () => this.location.back()
      });
      return;
    }
    this.location.back();
  }
  private restoreMenuQuantities() {
    if (!this.menuList) return;

    this.menuList.quantities = { ...this.quantities };
    this.menuList.applyFilters();
  }
  private formatBillFileName(tableId: string): string {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `BILL_${tableId}_${day}-${month}_${hours}${minutes}.pdf`;
  }
  filterMenu(text: string) {
    this.searchText = text;
    this.menuList.searchText = text;
    this.menuList.applyFilters();
  }
ngOnInit() {
  const url = this.router.url;

  if (url.includes('/parcel')) {
    this.orderType = 'Parcel';
    this.tableId = '';          // ✅ no table
    this.tableType = '';
  }
}


  ngAfterViewInit() {
   if (this.orderType === 'Parcel') {
    this.isRestoring = false;   // ✅ IMPORTANT
    this.loadingOrders = false;
    return;
  }

    this.activeOrders.getByTable(this.tableId).subscribe(items => {
      items.forEach(i => {
        this.cart[i.itemId] = {
          id: i.itemId,
          name: i.itemName,
          price: i.price,
          qty: i.qty
        } as any;
        this.quantities[i.itemId] = i.qty;
      });
      this.calculateTotals();
      if (items.length > 0) {
        this.tableStatus.setOrdered(this.tableId).subscribe();
      }
      setTimeout(() => {
        this.restoreMenuQuantities();
        this.isRestoring = false;
        this.loadingOrders = false;
        this.cdr.detectChanges();
      });

    });

  }

  isTableAlreadyOrdered(): boolean {
    return this.cartCount > 0;
  }

  onQuantityChange(ev: { item: MenuItem; qty: number }) {

    if (!ev || !ev.item || ev.qty == null) return;
    if (this.isRestoring) return;

   if (this.orderType === 'Parcel') {

  if (ev.qty === 0) {
    delete this.cart[ev.item.id];
    delete this.quantities[ev.item.id];
  } else {
    this.cart[ev.item.id] = { ...ev.item, qty: ev.qty };
    this.quantities[ev.item.id] = ev.qty;
  }

  if (this.menuList) {
    this.menuList.quantities = { ...this.quantities };
  }

  this.calculateTotals();
  this.cdr.detectChanges();
  return;
}

    const { item, qty } = ev;

    if (this.cartCount === 0 && qty > 0) {
      this.tableStatus.setOccupied(this.tableId).subscribe(() => {
        this.tableStatus.setOrdered(this.tableId).subscribe();
      });
    }

    if (qty === 0) {

      delete this.cart[item.id];
      delete this.quantities[item.id];

      this.activeOrders.deleteItem(this.tableId, item.id).subscribe(() => {
        if (this.cartCount === 0) {
          this.tableStatus.resetTable(this.tableId).subscribe();
        }
      });

    } else {

      this.cart[item.id] = { ...item, qty };
      this.quantities[item.id] = qty;

      if (qty === 1) {
        this.activeOrders.addItem(this.tableId, {
          itemId: item.id,
          itemName: item.name,
          price: item.price,
          qty
        }).subscribe();
      } else {
        this.activeOrders.updateItemQty(
          this.tableId,
          item.id,
          qty
        ).subscribe();
      }
    }

    this.calculateTotals();
    this.quantities = { ...this.quantities };
    this.cdr.detectChanges();
  }

  increaseQty(item: any) {
    const updatedQty = (this.quantities[item.id] || 0) + 1;
    this.onQuantityChange({ item, qty: updatedQty });
  }

  decreaseQty(item: any) {
    const updatedQty = (this.quantities[item.id] || 0) - 1;

    if (updatedQty <= 0) {
      this.removeFromCart(item.id);
      return;
    }

    this.onQuantityChange({ item, qty: updatedQty });
  }


  removeFromCart(id: number) {

    delete this.cart[id];
    delete this.quantities[id];
    if (this.orderType !== 'Parcel') {
    this.activeOrders.deleteItem(this.tableId, id).subscribe();
  }
    this.activeOrders.deleteItem(this.tableId, id).subscribe();
    if (this.menuList) {
      this.menuList.resetQuantity(id);
    }
    this.calculateTotals();
  }


  calculateTotals() {
    this.subtotal = Object.values(this.cart).reduce((sum: any, item: any) =>
      sum + item.price * item.qty, 0);

    this.discountAmount = this.subtotal * (this.discountPercent / 100);

    const afterDiscount = this.subtotal - this.discountAmount;

    this.tax = Math.round(afterDiscount * 0.05);

    this.total = afterDiscount + this.tax;
  }

  get proceedLabel() {
    return this.isOccupied ? 'Complete Order' : 'Proceed';
  }
  get cartCount(): number {
    return this.cart ? Object.keys(this.cart).length : 0;
  }

  saveOnly() {
    alert('Order saved');
  }
  saveAndKOT() {
    this.tableStatus.setOrdered(this.tableId).subscribe();
    this.receiptData = this.buildOrderData();
    this.receiptMode = 'KOT';
    setTimeout(() => {
      const el = document.getElementById('receipt');

      html2pdf()
        .set({
          margin: 5,
          filename: this.formatBillFileName(this.tableId),
          html2canvas: { scale: 2 }
        })
        .from(el!)
        .save();
    }, 100);
  }

  // saveAndPrintBill() {

  //   this.tableStatus.setBilling(this.tableId).subscribe();

  //   this.receiptData = this.buildOrderData();
  //   this.receiptMode = 'BILL';

  //   setTimeout(() => {
  //     const el = document.getElementById('receipt');

  //     html2pdf()
  //       .set({
  //         filename: `BILL_${this.tableId}.pdf`
  //       })
  //       .from(el!)
  //       .save();
  //   }, 100);
  // }


  settleOrder(paymentMode: 'CASH' | 'CARD' | 'UPI') {
    const orderData = {
      tableId: this.tableId,
      orderType: this.orderType,
      subtotal: this.subtotal,
      tax: this.tax,
      discount: this.discountPercent,
      total: this.total,
      paymentMode,
      createdAt: new Date(),
      items: Object.values(this.cart).map(i => ({
        itemName: i.name,
        price: i.price,
        qty: i.qty
      }))
    };

    const BASE_HEIGHT = 85;     
    const ITEM_HEIGHT = 6;  
    const itemCount = orderData.items.length;
    const calculatedHeight =
    BASE_HEIGHT + (itemCount * ITEM_HEIGHT);
    this.completedOrders.saveOrder(orderData).subscribe(() => {
      this.receiptData = orderData;
      this.receiptMode = 'BILL';
      this.cdr.detectChanges();
      setTimeout(() => {
        const el = document.getElementById('receipt');
        if (!el) return;

     html2pdf()
  .set({
    margin: [1, 1, 1, 1],
    filename: this.formatBillFileName(this.tableId),
    html2canvas: { scale: 2 },
    jsPDF: {
      unit: 'mm',
      format: [58, calculatedHeight],
      orientation: 'portrait'
    }
  })
  .from(el)
  .save()

          .then(() => {
            this.activeOrders.clearTable(this.tableId).subscribe(() => {
              this.tableStatus.resetTable(this.tableId).subscribe(() => {
                this.router.navigate(['/dashboard']);
              });
            });
          });

      }, 150);
    });
  }
}
