import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompletedOrdersService } from '../../services/completed-orders.service';
import { LoaderService } from '../../services/loader.service';
import { LoaderComponent } from '../../layout/components/loader.component';
import { ReportsChartsComponent } from './reports-charts/reports-charts.component';
type PaymentMode = 'CASH' | 'CARD' | 'UPI';

@Component({
  standalone: true,
  selector: 'app-reports',
  imports: [CommonModule, FormsModule, LoaderComponent, ReportsChartsComponent],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {

  chartRange: 'week' | 'month' = 'week';
  reportType: 'summary' | 'charts' | 'tables' = 'summary';

  allOrders: any[] = [];
  orders: any[] = [];
  filteredOrders: any[] = [];
  chartOrders: any[] = [];

  fromDate!: string;
  toDate!: string;

  summary = {
    totalOrders: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
    totalTax: 0
  };

  taxPercent = 0;

  topItems: any[] = [];
  paymentSplit: Record<PaymentMode, number> = {
    CASH: 0,
    CARD: 0,
    UPI: 0
  };

  categoryStats: any[] = [];
  tableStats: any[] = [];
  peakHour = 'N/A';

  constructor(
    private orderService: CompletedOrdersService,
    public loader: LoaderService
  ) { }

  ngOnInit(): void {
    // const today = new Date().toISOString().split('T')[0];
    const today = new Date();
    const from = new Date();
    from.setDate(today.getDate() - 6);
    this.fromDate = from.toISOString().split('T')[0];
    this.toDate = today.toISOString().split('T')[0];
    this.loadReports();
  }
  onReportTypeChange() {
    if (this.reportType === 'charts') {
      this.chartRange = 'week';
    }
    this.applyDateFilter();
  }

  loadReports() {
    this.loader.show();
    this.orderService.getAll().subscribe({
      next: orders => {
        this.allOrders = orders.filter(o => o.total > 0);
        this.applyDateFilter();
      },
      complete: () => this.loader.hide()
    });
  }

  applyDateFilter() {
    const from = new Date(this.fromDate);
    from.setHours(0, 0, 0, 0);

    const to = new Date(this.toDate);
    to.setHours(23, 59, 59, 999);

    if (this.reportType === 'charts') {
      const rangeStart = new Date(from);

      if (this.chartRange === 'week') {
        rangeStart.setDate(from.getDate() - 6);
      }

      if (this.chartRange === 'month') {
        rangeStart.setDate(1);
      }

      this.orders = this.allOrders.filter(o => {
        const d = new Date(o.createdDate);
        return d >= rangeStart && d <= to;
      });
    } else {
      this.orders = this.allOrders.filter(o => {
        const d = new Date(o.createdDate);
        return d >= from && d <= to;
      });
    }

    this.buildReports();
  }


  buildReports() {
    this.buildSummary();
    this.buildTopItems();
    this.buildPaymentSplit();
    this.buildCategoryStats();
    this.buildTableStats();
    this.buildPeakHour();
  }

  buildSummary() {
    this.summary.totalOrders = this.orders.length;
    this.summary.totalRevenue = this.orders.reduce((s, o) => s + o.total, 0);
    this.summary.totalTax = this.orders.reduce((s, o) => s + o.tax, 0);

    this.summary.avgOrderValue =
      this.summary.totalOrders > 0
        ? Math.round(this.summary.totalRevenue / this.summary.totalOrders)
        : 0;

    this.taxPercent =
      this.summary.totalRevenue > 0
        ? Math.round((this.summary.totalTax / this.summary.totalRevenue) * 100)
        : 0;
  }

  buildTopItems() {
    const map = new Map<string, { qty: number; revenue: number }>();

    this.orders.forEach(o =>
      o.items.forEach((i: any) => {
        const curr = map.get(i.itemName) || { qty: 0, revenue: 0 };
        map.set(i.itemName, {
          qty: curr.qty + i.qty,
          revenue: curr.revenue + i.qty * i.price
        });
      })
    );

    this.topItems = Array.from(map.entries())
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }

  buildPaymentSplit() {
    this.paymentSplit = { CASH: 0, CARD: 0, UPI: 0 };

    this.orders.forEach(o => {
      const mode = o.paymentMode?.toUpperCase() as PaymentMode;
      if (mode === 'CASH' || mode === 'CARD' || mode === 'UPI') {
        this.paymentSplit[mode] += o.total;
      }
    });
  }

  buildCategoryStats() {
    const map = new Map<string, number>();

    this.orders.forEach(o =>
      o.items.forEach((i: any) =>
        map.set(i.category || 'Others', (map.get(i.category || 'Others') || 0) + i.qty)
      )
    );

    this.categoryStats = Array.from(map.entries())
      .map(([name, qty]) => ({ name, qty }));
  }

  buildTableStats() {
    const map = new Map<string, number>();

    this.orders.forEach(o =>
      map.set(o.tableId || 'Parcel', (map.get(o.tableId || 'Parcel') || 0) + 1)
    );

    this.tableStats = Array.from(map.entries())
      .map(([table, orders]) => ({ table, orders }))
      .slice(0, 5);
  }

  buildPeakHour() {
    const map = new Map<number, number>();

    this.orders.forEach(o => {
      const h = new Date(o.createdDate).getHours();
      map.set(h, (map.get(h) || 0) + 1);
    });

    const peak = Array.from(map.entries()).sort((a, b) => b[1] - a[1])[0];
    this.peakHour = peak ? `${peak[0]}:00 - ${peak[0] + 1}:00` : 'N/A';
  }
}
