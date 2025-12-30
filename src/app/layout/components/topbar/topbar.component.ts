import {
  Component,
  ViewChild,
  ElementRef
} from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';

import { Overlay, OverlayRef, OverlayModule } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';

import { TakeAwayPopoverComponent } from '../../../pages/settings/takeaway/takeawaypopover/take-away-popover.component';
import { CompletedOrdersService } from '../../../services/completed-orders.service';
import { BillSearchPopupComponent } from '../../../billsearch/bill-search-popup.component';
import { ReservationPopoverComponent } from '../../../resevation/reservation-popover.component';
import { TableStatusService } from '../../../services/table-status.service';
import { TablePreferenceService } from '../../../services/table-preferences.sevice';
import { RealtimeService } from '../../../core/signalrsevices/realtime.service';
@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatMenuModule,
    OverlayModule,
    FormsModule,
    BillSearchPopupComponent,
    ReservationPopoverComponent 
  ],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss'
})
export class TopbarComponent {

  // 🔹 Take Away button
  @ViewChild('newOrderBtn', { read: ElementRef })
  newOrderBtn!: ElementRef;

  // 🔹 Bill search box
  @ViewChild('billSearchBox', { read: ElementRef })
  billSearchBox!: ElementRef;

  billNo: string = '';
  isInvoiceInvalid = false; 
  isSearching = false;
  sections: any[] = [];
  tableStatusMap: Record<string, any> = {};

private reservationOverlay?: OverlayRef;

  private takeAwayOverlay?: OverlayRef;
  private billOverlay?: OverlayRef;
  private markInvalid() {
  this.isInvoiceInvalid = true;

  setTimeout(() => {
    this.isInvoiceInvalid = false;
  }, 2000);
}


  constructor(
    private router: Router,
    private overlay: Overlay,
    private completedOrders: CompletedOrdersService,
    private tableStatus: TableStatusService,
     private tablePref: TablePreferenceService,
     private realtime: RealtimeService
  ) {}

ngOnInit() {
  const token = localStorage.getItem('token');
  if (token) {
    this.realtime.connect(token);
  }

  this.tablePref.getAll().subscribe(res => {
    this.sections = res;
  });

  // 🔥 LIVE SUBSCRIPTION (THIS IS THE FIX)
  this.tableStatus.watchTableStates().subscribe(map => {
    this.tableStatusMap = Object.fromEntries(map);
  });

  // Optional: initial load to seed state
  this.tableStatus.loadActiveTables().subscribe(states => {
    states.forEach(s => {
      this.tableStatus.setTableState(s.tableId, s.status, s.startTime);
    });
  });
}



  // =========================
  // TAKE AWAY POPOVER
  // =========================
  openNewOrderPopover() {

    if (this.takeAwayOverlay) {
      this.takeAwayOverlay.dispose();
      this.takeAwayOverlay = undefined;
      return;
    }

    const positionStrategy = this.overlay.position()
      .flexibleConnectedTo(this.newOrderBtn)
      .withPositions([{
        originX: 'start',
        originY: 'bottom',
        overlayX: 'start',
        overlayY: 'top',
        offsetY: 8
      }]);

    this.takeAwayOverlay = this.overlay.create({
      positionStrategy,
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop'
    });

    const portal = new ComponentPortal(TakeAwayPopoverComponent);
    const componentRef = this.takeAwayOverlay.attach(portal);

    componentRef.instance.selected.subscribe(type => {
      this.takeAwayOverlay?.dispose();
      this.takeAwayOverlay = undefined;

      if (type === 'Parcel') {
        this.router.navigate(['dashboard/orders/parcel']);
      }
    });

    this.takeAwayOverlay.backdropClick().subscribe(() => {
      this.takeAwayOverlay?.dispose();
      this.takeAwayOverlay = undefined;
    });
  }

searchBill() {
  // 🔒 Prevent double click / double enter
  if (this.isSearching) return;

  const value = this.billNo?.trim();

  if (!value || !/^\d+$/.test(value)) {
    this.markInvalid();
    return;
  }

  const restaurantId = 1; // TODO: dynamic
  const year = new Date().getFullYear();
  const invoice = `INV-${restaurantId}-${year}-${value}`;

  this.isSearching = true;   // 🔒 LOCK

  this.completedOrders.getByInvoice(invoice).subscribe({
    next: order => {
      this.isSearching = false;     // 🔓 UNLOCK
      this.isInvoiceInvalid = false;
      this.openBillPopup(order);
    },
    error: err => {
      this.isSearching = false;     // 🔓 UNLOCK

      if (err.status === 404) {
        this.markInvalid();
      } else {
        console.error(err);
      }
    }
  });
}



  openBillPopup(order: any) {
    this.closeBillPopup();

    const positionStrategy = this.overlay.position()
      .flexibleConnectedTo(this.billSearchBox)
      .withPositions([{
        originX: 'start',
        originY: 'bottom',
        overlayX: 'start',
        overlayY: 'top',
        offsetY: 6
      }]);

    this.billOverlay = this.overlay.create({
      positionStrategy,
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop'
    });

    const portal = new ComponentPortal(BillSearchPopupComponent);
    const ref = this.billOverlay.attach(portal);
    ref.instance.order = order;

    this.billOverlay.backdropClick().subscribe(() => {
      this.closeBillPopup();
    });
  }

closeBillPopup() {
  this.billOverlay?.dispose();
  this.billOverlay = undefined;
  this.billNo = '';
  this.isInvoiceInvalid = false;
  this.isSearching = false;
}
openReservationPopover(btn: HTMLElement) {

  if (this.reservationOverlay) {
    this.reservationOverlay.dispose();
    this.reservationOverlay = undefined;
    return;
  }

  const positionStrategy = this.overlay.position()
    .flexibleConnectedTo(btn) // ✅ HTMLElement is valid here
    .withPositions([{
      originX: 'start',
      originY: 'bottom',
      overlayX: 'start',
      overlayY: 'top',
      offsetY: 8
    }]);

  this.reservationOverlay = this.overlay.create({
    positionStrategy,
    hasBackdrop: true,
    backdropClass: 'cdk-overlay-transparent-backdrop'
  });

  const portal = new ComponentPortal(ReservationPopoverComponent);
  const ref = this.reservationOverlay.attach(portal);

  ref.instance.sections = this.sections;
  ref.instance.tableStatusMap = this.tableStatusMap;

  ref.instance.reserved.subscribe((tableId: string) => {
    this.tableStatus.setReservation(tableId).subscribe(() => {
      this.reservationOverlay?.dispose();
      this.reservationOverlay = undefined;
    });
  });

  this.reservationOverlay.backdropClick().subscribe(() => {
    this.reservationOverlay?.dispose();
    this.reservationOverlay = undefined;
  });
}





  // =========================
  // NAVIGATION
  // =========================
  // reservation() {
  //   this.router.navigate(['/reservation']);
  // }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
