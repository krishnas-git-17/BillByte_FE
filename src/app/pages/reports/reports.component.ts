import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompletedOrdersService } from '../../services/completed-orders.service';
import { LoaderService } from '../../services/loader.service';
import { LoaderComponent } from '../../layout/components/loader.component';

@Component({
  standalone: true,
  selector: 'app-reports',
  imports: [CommonModule, LoaderComponent],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  topItems: any[] = [];
  todaySummary = {
    totalRevenue: 0,
    totalTax: 0,
    orderCount: 0,
    cash: 0,
    card: 0,
    upi: 0
  };

  constructor(
    private orderService: CompletedOrdersService,
    public loader: LoaderService
  ) {}

  ngOnInit(): void {
    this.loadTodaySales();
  }

  loadTodaySales() {
    this.loader.show();
    this.orderService.getAll().subscribe({
      next: (data: any[]) => {
        this.calculateDailySummary(data);
      },
      complete: () => this.loader.hide()
    });
  }

  calculateDailySummary(orders: any[]) {
    const today = new Date().toISOString().split('T')[0];
const itemMap = new Map();

orders.forEach(order => {
    order.items.forEach((item: any) => {
      const current = itemMap.get(item.itemName) || { qty: 0, revenue: 0 };
      itemMap.set(item.itemName, {
        qty: current.qty + item.qty,
        revenue: current.revenue + (item.price * item.qty)
      });
    });
  });

  this.topItems = Array.from(itemMap.entries())
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);
    // 1. Filter only today's non-empty orders
    const todayOrders = orders.filter(o => 
      o.createdDate.startsWith(today) && o.total > 0
    );

    // 2. Reset and Accumulate
    this.todaySummary = todayOrders.reduce((acc, order) => {
      acc.totalRevenue += order.total;
      acc.totalTax += order.tax;
      acc.orderCount++;

      // Group by Payment Mode
      const mode = order.paymentMode?.toUpperCase();
      if (mode === 'CASH') acc.cash += order.total;
      else if (mode === 'CARD') acc.card += order.total;
      else if (mode === 'UPI') acc.upi += order.total;

      return acc;
    }, { totalRevenue: 0, totalTax: 0, orderCount: 0, cash: 0, card: 0, upi: 0 });
  }
}