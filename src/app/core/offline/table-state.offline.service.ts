import { Injectable } from '@angular/core';
import { SqliteService } from './sqlite.service';

export type TableStatus =
  | 'available'
  | 'occupied'
  | 'ordered'
  | 'billing'
  | 'reservation';

@Injectable({ providedIn: 'root' })
export class TableStateOfflineService {

  constructor(private sqlite: SqliteService) {}

  getAll(): { tableId: string; status: TableStatus; startTime?: string }[] {
    const res = this.sqlite.query(
      'SELECT tableId, status, startTime FROM table_state'
    );

    if (!res.length) return [];

    return res[0].values.map((r: any[]) => ({
      tableId: r[0],
      status: r[1],
      startTime: r[2]
    }));
  }

  upsert(
    tableId: string,
    status: TableStatus,
    startTime?: string,
    synced = false
  ) {
    this.sqlite.run(
      `INSERT OR REPLACE INTO table_state
       (tableId, status, startTime, synced)
       VALUES (?, ?, ?, ?)`,
      [tableId, status, startTime ?? null, synced ? 1 : 0]
    );
  }

  remove(tableId: string) {
    this.sqlite.run(
      'DELETE FROM table_state WHERE tableId=?',
      [tableId]
    );
  }

  unsynced(): any[] {
    const res = this.sqlite.query(
      'SELECT tableId, status FROM table_state WHERE synced=0'
    );

    if (!res.length) return [];

    return res[0].values.map((r: any[]) => ({
      tableId: r[0],
      status: r[1]
    }));
  }
clearAll() {
  this.sqlite.run('DELETE FROM table_preferences');
}

  markSynced(tableId: string) {
    this.sqlite.run(
      'UPDATE table_state SET synced=1 WHERE tableId=?',
      [tableId]
    );
  }
}
