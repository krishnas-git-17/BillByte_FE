import {
  Component,
  ViewChild,
  ElementRef
} from '@angular/core';
import { Router } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule } from '@angular/forms';

import { Overlay, OverlayRef, OverlayModule } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { TakeAwayPopoverComponent } from '../../../pages/settings/takeaway/takeawaypopover/take-away-popover.component';
@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatMenuModule,
    OverlayModule,
    FormsModule
  ],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss'
})
export class TopbarComponent {

  @ViewChild('newOrderBtn', { read: ElementRef })
  newOrderBtn!: ElementRef;
billNo: string = '';  
  private overlayRef?: OverlayRef;

  constructor(
    private router: Router,
    private overlay: Overlay
  ) {}

  openNewOrderPopover() {

    // Toggle close
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = undefined;
      return;
    }

    const positionStrategy = this.overlay.position()
  .flexibleConnectedTo(this.newOrderBtn)
  .withPositions([{
    originX: 'start',
    originY: 'bottom',
    overlayX: 'start',
    overlayY: 'top',
    offsetY: 8        // ✅ GAP between button & popup
  }]);


    this.overlayRef = this.overlay.create({
      positionStrategy,
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop'
    });

    const portal = new ComponentPortal(TakeAwayPopoverComponent);
    const componentRef = this.overlayRef.attach(portal);

   componentRef.instance.selected.subscribe(type => {
  this.overlayRef?.dispose();
  this.overlayRef = undefined;

  // 🔥 PARCEL FLOW (no table)
  if (type === 'Parcel') {
    this.router.navigate(['dashboard/orders/parcel']);
    return;
  }

  // (future) Zomato / Swiggy
});


    // Close on outside click
    this.overlayRef.backdropClick().subscribe(() => {
      this.overlayRef?.dispose();
      this.overlayRef = undefined;
    });
  }

  reservation() {
    this.router.navigate(['/reservation']);
  }



  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
