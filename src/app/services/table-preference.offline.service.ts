import { Injectable } from '@angular/core';
import { SqliteService } from '../core/offline/sqlite.service';

@Injectable({ providedIn: 'root' })
export class TablePreferenceOfflineService {

  constructor(private sqlite: SqliteService) {}

getAll(): any[] {
  const res = this.sqlite.query(
    'SELECT payload FROM table_preferences'
  );

  if (!res.length || !res[0].values.length) return [];

  return res[0].values.map((v: any[]) => JSON.parse(v[0]));
}


  upsert(item: any, synced = false) {
    this.sqlite.run(
      `INSERT OR REPLACE INTO table_preferences
       (id, payload, synced)
       VALUES (?, ?, ?)`,
      [item.id, JSON.stringify(item), synced ? 1 : 0]
    );
  }

  delete(id: number) {
    this.sqlite.run(
      'DELETE FROM table_preferences WHERE id=?',
      [id]
    );
  }

unsynced(): any[] {
  const res = this.sqlite.query(
    'SELECT id, payload FROM table_preferences WHERE synced=0'
  );

  if (!res.length) return [];

  return res[0].values.map((r: any[]) => ({
    id: r[0],
    payload: JSON.parse(r[1])
  }));
}



  markSynced(id: number) {
    this.sqlite.run(
      'UPDATE table_preferences SET synced=1 WHERE id=?',
      [id]
    );
  }
}
