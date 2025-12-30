import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

declare global {
  interface Window {
    generateQRCode: (text: string, size?: number) => string;
  }
}

export interface ReceiptItem {
  itemName: string;
  qty: number;

  // BILL only
  price?: number;

  // KOT only
  specialNote?: string;
}

@Component({
  selector: 'app-receipt',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './receipt.component.html',
  styleUrls: ['./receipt.component.scss']
})
export class ReceiptComponent {

  @Input() mode: 'KOT' | 'BILL' = 'BILL';

  @Input() order!: {
    tableId?: string;
    createdAt: Date;

    // BILL
    invoiceNo?: string;
    subtotal?: number;
    tax?: number;
    total?: number;

    // KOT
    kotNo?: number;

    items: ReceiptItem[];
  };

  getTotalQty(): number {
    return this.order.items.reduce((sum, i) => sum + i.qty, 0);
  }

  getItemAmount(i: ReceiptItem): number {
    return (i.price ?? 0) * i.qty;
  }

  get upiQrDataUrl(): string {
    if (this.mode !== 'BILL' || !window.generateQRCode) return '';

    const upiId = '8886784877-2@ybl';
    const merchantName = 'BillByte';
    const amount = this.order.total ?? 0;
    const invoice = this.order.invoiceNo || 'AUTO';

    const upiString =
      `upi://pay?pa=${upiId}` +
      `&pn=${encodeURIComponent(merchantName)}` +
      `&am=${amount}` +
      `&cu=INR` +
      `&tn=${encodeURIComponent('Invoice-' + invoice)}`;

    return window.generateQRCode(upiString, 120);
  }
}
