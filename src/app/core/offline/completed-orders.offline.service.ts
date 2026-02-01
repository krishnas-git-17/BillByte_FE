import { Injectable } from '@angular/core';
import { SqliteService } from './sqlite.service';
import { AuthService } from '../authservices/auth.service';

@Injectable({ providedIn: 'root' })
export class CompletedOrdersOfflineService {

  constructor(
    private sqlite: SqliteService,
    private auth: AuthService
  ) {}

  getAll(): any[] {
    const rid = this.auth.getRestaurantId();
    if (!rid) return [];

    const res = this.sqlite.query(
      `SELECT payload FROM completed_orders
       WHERE restaurantId=?
       ORDER BY id DESC`,
      [rid]
    );

    if (!res.length || !res[0].values.length) return [];
    return res[0].values.map((r: any[]) => JSON.parse(r[0]));
  }

  add(order: any, synced = false) {
    const rid = this.auth.getRestaurantId();
    if (!rid) return;

    this.sqlite.run(
      `INSERT INTO completed_orders
       (restaurantId, invoiceNo, payload, synced)
       VALUES (?, ?, ?, ?)`,
      [
        rid,
        order.invoiceNo ?? null,
        JSON.stringify(order),
        synced ? 1 : 0
      ]
    );
  }

  unsynced(): any[] {
    const rid = this.auth.getRestaurantId();
    if (!rid) return [];

    const res = this.sqlite.query(
      `SELECT id, payload FROM completed_orders
       WHERE restaurantId=? AND synced=0`,
      [rid]
    );

    if (!res.length) return [];

    return res[0].values.map((r: any[]) => ({
      id: r[0],
      payload: JSON.parse(r[1])
    }));
  }

  markSynced(id: number, invoiceNo: string) {
    this.sqlite.run(
      `UPDATE completed_orders
       SET synced=1, invoiceNo=?
       WHERE id=?`,
      [invoiceNo, id]
    );
  }

  clearAll() {
    const rid = this.auth.getRestaurantId();
    if (!rid) return;

    this.sqlite.run(
      `DELETE FROM completed_orders WHERE restaurantId=?`,
      [rid]
    );
  }
}
