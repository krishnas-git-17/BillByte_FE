import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Tell TypeScript that a global function exists on window
 */
declare global {
  interface Window {
    generateQRCode: (text: string, size?: number) => string;
  }
}

@Component({
  selector: 'app-receipt',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './receipt.component.html',
  styleUrls: ['./receipt.component.scss']
})
export class ReceiptComponent {

  @Input() order!: {
    tableId?: string;
    orderType?: string;
    invoiceNo?: string;
    createdAt: Date;
    subtotal: number;
    tax: number;
    total: number;
    items: {
      itemName: string;
      price: number;
      qty: number;
    }[];
  };

  @Input() mode: 'KOT' | 'BILL' = 'BILL';

  /**
   * Total quantity of all items
   */
  getTotalQty(items: any[]): number {
    return items.reduce((sum, i) => sum + i.qty, 0);
  }

  /**
   * Generate UPI QR code (from code itself)
   * No npm, no external API
   */
  get upiQrDataUrl(): string {
    if (!this.order || !window.generateQRCode) {
      return '';
    }

    const upiId = '8886784877-2@ybl'; // 🔴 replace with real merchant UPI
    const merchantName = 'BillByte';
    const amount = this.order.total;
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
