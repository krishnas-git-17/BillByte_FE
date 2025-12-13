import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule,MatIconModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent {

  @Input() cart: any = {};
  @Input() total = 0;
 @Output() back = new EventEmitter<void>();
  @Output() complete = new EventEmitter<{
    paymentMode: 'CASH' | 'CARD' | 'UPI'
  }>();

   goBack() {
    this.back.emit();
  }
  paymentMode: 'CASH' | 'CARD' | 'UPI' | null = null;

  confirmCheckout() {
    if (!this.paymentMode) {
      alert('Please select payment mode');
      return;
    }

    this.complete.emit({
      paymentMode: this.paymentMode
    });
  }
}
