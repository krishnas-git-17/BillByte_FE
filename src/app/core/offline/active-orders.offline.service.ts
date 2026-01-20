import { Injectable } from '@angular/core';
import { SqliteService } from './sqlite.service';
import { ActiveOrderItemDto } from '../../services/active-orders.service';

@Injectable({ providedIn: 'root' })
export class ActiveOrdersOfflineService {

  constructor(private sqlite: SqliteService) {}

  getByTable(tableId: string): any[] {
    const res = this.sqlite.query(
      'SELECT payload FROM active_table_items WHERE tableId=?',
      [tableId]
    );

    if (!res.length) return [];

    return res[0].values.map((v: any[]) => JSON.parse(v[0]));
  }

  addOrUpdate(tableId: string, item: ActiveOrderItemDto, synced = false) {
    this.sqlite.run(
      `INSERT OR REPLACE INTO active_table_items
       (tableId, itemId, payload, synced)
       VALUES (?, ?, ?, ?)`,
      [tableId, item.itemId, JSON.stringify(item), synced ? 1 : 0]
    );
  }

  updateQty(tableId: string, itemId: number, qty: number) {
    const res = this.sqlite.query(
      'SELECT payload FROM active_table_items WHERE tableId=? AND itemId=?',
      [tableId, itemId]
    );

    if (!res.length || !res[0].values.length) return;

  const raw = res[0].values[0][0] as string | null;

if (!raw) return;

const payload = JSON.parse(raw);


    if (qty <= 0) {
      this.remove(tableId, itemId);
    } else {
      payload.qty = qty;
      this.addOrUpdate(tableId, payload);
    }
  }

  remove(tableId: string, itemId: number) {
    this.sqlite.run(
      'DELETE FROM active_table_items WHERE tableId=? AND itemId=?',
      [tableId, itemId]
    );
  }

  clearTable(tableId: string) {
    this.sqlite.run(
      'DELETE FROM active_table_items WHERE tableId=?',
      [tableId]
    );
  }

  unsynced(): any[] {
    const res = this.sqlite.query(
      'SELECT tableId, payload FROM active_table_items WHERE synced=0'
    );

    if (!res.length) return [];

    return res[0].values.map((r: any[]) => ({
      tableId: r[0],
      item: JSON.parse(r[1])
    }));
  }

  markSynced(tableId: string, itemId: number) {
    this.sqlite.run(
      `UPDATE active_table_items
       SET synced=1
       WHERE tableId=? AND itemId=?`,
      [tableId, itemId]
    );
  }
}
