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
import { KotService } from '../../services/kot.service';
import { KotItem } from '../../services/kot.service';
import { ReceiptComponent } from '../../receipt/receipt.component';
import { RealtimeService } from '../../core/signalrsevices/realtime.service';
import html2pdf from 'html2pdf.js';
import { Router } from '@angular/router';
// import { forkJoin } from 'rxjs';


type CartItem = MenuItem & {
  qty: number;
  kotQty?: number;     // ✅ qty already printed in KOT
  notes?: string[];
  showNoteInput?: boolean;
  noteInput?: string;
};



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
 cart: { [id: number]: CartItem } = {};
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
  showNotes = false;
notes?: string[];  
specialNotes: string[] = [];
showNoteInput?: boolean;
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
     private kotService: KotService,
      private realtime: RealtimeService,
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
      if (this.orderType === 'Parcel') {
        this.router.navigate(['/dashboard']);
        return;
      }
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
private syncCartFromSignalR(items: any[]) {

  // Table cleared
  if (!items || items.length === 0) {
    this.cart = {};
    this.quantities = {};
    this.calculateTotals();
    return;
  }

  const newCart: any = {};
  const newQuantities: any = {};

  items.forEach(i => {
    newCart[i.itemId] = {
      id: i.itemId,
      name: i.itemName,
      price: i.price,
      qty: i.qty,
      kotQty: this.cart[i.itemId]?.kotQty ?? 0,
      notes: this.cart[i.itemId]?.notes ?? []
    };

    newQuantities[i.itemId] = i.qty;
  });

  this.cart = newCart;
  this.quantities = newQuantities;

  this.calculateTotals();
  this.restoreMenuQuantities();
  this.cdr.detectChanges();
}


ngOnInit() {
   const token = localStorage.getItem('token')!;
  this.realtime.connect(token);
  this.realtime.events$.subscribe(event => {

  if (event.type === 'ACTIVE_TABLE_ITEMS_CHANGED') {
    const { tableId, items } = event.payload;

    // 🔒 Ignore other tables
    if (tableId !== this.tableId) return;

    this.syncCartFromSignalR(items);
  }

});

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
          qty: i.qty,
          kotQty: 0,
          notes: [] 
        } as any;
        this.quantities[i.itemId] = i.qty;
      });
      
      this.calculateTotals();
      // if (items.length > 0) {
      //   this.tableStatus.setOrdered(this.tableId).subscribe();
      // }
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

  const { item, qty } = ev;

  // ========== PARCEL ==========
  if (this.orderType === 'Parcel') {

    if (qty <= 0) {
      delete this.cart[item.id];
      delete this.quantities[item.id];
    } else {
      this.cart[item.id] = { ...item, qty };
      this.quantities[item.id] = qty;
    }

    if (this.menuList) {
      this.menuList.quantities = { ...this.quantities };
    }

    this.calculateTotals();
    this.cdr.detectChanges();
    return;
  }

  // ========== DINE / TABLE (DRAFT MODE ONLY) ==========
  if (qty <= 0) {
    delete this.cart[item.id];
    delete this.quantities[item.id];
  } else {
    this.cart[item.id] = { ...item, qty };
    this.quantities[item.id] = qty;
  }

  // ❌ NO API CALLS
  // ❌ NO TABLE STATUS CHANGE

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

//   toggleNotes() {
//   this.showNotes = !this.showNotes;
// }

// addNote(event: KeyboardEvent) {
//   if (event.key !== 'Enter') return;

//   const value = this.noteInput.trim();
//   if (!value) return;

//   // max 5 notes, single word
//   if (this.specialNotes.length >= 5) return;

//   if (!this.specialNotes.includes(value)) {
//     this.specialNotes.push(value);
//   }

//   this.noteInput = '';
// }

toggleItemNote(item: CartItem) {
  item.showNoteInput = !item.showNoteInput;
  item.noteInput = '';
}

addItemNote(item: CartItem) {
  const value = (item.noteInput || '').trim();
  if (!value) return;

  if (!item.notes) {
    item.notes = [];
  }

  if (item.notes.length >= 5) return; // max 5 notes

  item.notes.push(value);
  item.noteInput = '';
  item.showNoteInput = false;
}

removeItemNote(item: CartItem, index: number) {
  item.notes?.splice(index, 1);
}



// updateItemNote(item: any, value: string) {
//   item.specialNote = value;
// }



// 🔹 Discount calculation
onDiscountChange() {
  this.calculateTotals();
}


saveOnly() {
  if (this.cartCount === 0) return;

  const items = Object.values(this.cart);

  // Clear old draft
  this.activeOrders.clearTable(this.tableId).subscribe(() => {

    // Save current items
    items.forEach(i => {
      this.activeOrders.addItem(this.tableId, {
        itemId: i.id,
        itemName: i.name,
        price: i.price,
        qty: i.qty
      }).subscribe();
    });

    // Update table status
    this.tableStatus.setOrdered(this.tableId).subscribe(() => {
      alert('Order saved');
    });
  });
}


saveAndKOT() {
  if (this.cartCount === 0) return;

  const items = Object.values(this.cart);
  const kotItems: KotItem[] = [];

  // 1️⃣ Build incremental KOT
  for (const i of items) {
    const alreadySent = i.kotQty ?? 0;
    const diffQty = i.qty - alreadySent;

    if (diffQty !== 0) {
      kotItems.push({
        itemName: i.name,
        qty: diffQty,
        specialNote:
          diffQty < 0
            ? 'CANCEL'
            : i.notes?.length
              ? i.notes.join(', ')
              : ''
      });
    }
  }

  if (kotItems.length === 0) {
    alert('No changes for KOT');
    return;
  }

  // 2️⃣ FIRST: Save KOT
  this.kotService.createKot({
    tableId: this.tableId,
    items: kotItems
  }).subscribe(kot => {

    // 3️⃣ THEN: Persist FULL state to ActiveOrders
    this.activeOrders.clearTable(this.tableId).subscribe(() => {
      items.forEach(i => {
        this.activeOrders.addItem(this.tableId, {
          itemId: i.id,
          itemName: i.name,
          price: i.price,
          qty: i.qty
        }).subscribe();
      });
    });

    // 4️⃣ Update local KOT baseline
    items.forEach(i => {
      i.kotQty = i.qty;
    });

    // 5️⃣ Print KOT
    this.receiptData = {
      tableId: this.tableId,
      createdAt: new Date(),
      kotNo: kot.kotNo,
      items: kotItems
    };

    this.receiptMode = 'KOT';
    this.cdr.detectChanges();

    setTimeout(() => {
      const el = document.getElementById('receipt');
      if (el) html2pdf().from(el).save();
    }, 150);
  });
}











billing(paymentMode: 'CASH' | 'CARD' | 'UPI') {

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
  const calculatedHeight = BASE_HEIGHT + (itemCount * ITEM_HEIGHT);

  this.completedOrders.saveOrder(orderData).subscribe((res: any) => {

    this.receiptData = {
      ...orderData,
      invoiceNo: res.invoiceNo
    };
    this.receiptMode = 'BILL';
    this.cdr.detectChanges();

    setTimeout(() => {
      const el = document.getElementById('receipt');
      if (!el) return;

      html2pdf()
        .set({
          margin: 0,
          filename: this.formatBillFileName(
            this.receiptData.invoiceNo || this.tableId
          ),
          html2canvas: { scale: 2 },
          jsPDF: {
            unit: 'mm',
            format: [58, calculatedHeight],
            orientation: 'portrait'
          }
        })
        .from(el)
        .save();

      // ❌ NO clearTable
      // ❌ NO resetTable
      // ❌ NO navigation

    }, 150);
  });
}
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

  this.completedOrders.saveOrder(orderData).subscribe(() => {

    this.activeOrders.clearTable(this.tableId).subscribe(() => {

      this.tableStatus.resetTable(this.tableId).subscribe(() => {
        this.router.navigate(['/dashboard']);
      });

    });
  });
}

}
