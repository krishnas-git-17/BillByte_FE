import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ReportService {

  getCompletedOrders() {
    return JSON.parse(localStorage.getItem("completedOrders") || "[]");
  }

  // ✔ Orders Today
  getTodayOrders() {
    const today = new Date().toDateString();

    return this.getCompletedOrders().filter((o: any) =>
      new Date(o.completedAt).toDateString() === today
    );
  }

  // ✔ Orders Yesterday
  getYesterdayOrders() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const yesterday = d.toDateString();

    return this.getCompletedOrders().filter((o: any) =>
      new Date(o.completedAt).toDateString() === yesterday
    );
  }

  // ✔ Revenue Today
  getTodayRevenue() {
    return this.getTodayOrders().reduce((sum: number, o: any) => sum + o.total, 0);
  }

  // ✔ Active Tables
  getActiveTables(tableStatus: any) {
    return Object.values(tableStatus).filter((s: any) => s === 'occupied').length;
  }
}
