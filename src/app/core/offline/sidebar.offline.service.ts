import { Injectable } from '@angular/core';
import { SqliteService } from './sqlite.service';

@Injectable({ providedIn: 'root' })
export class SidebarOfflineService {

  constructor(private sqlite: SqliteService) {}

  getAll(): any[] {
    const res = this.sqlite.query(
      'SELECT payload FROM sidebar_items'
    );

    if (!res.length || !res[0].values.length) return [];

    return res[0].values.map((v: any[]) => JSON.parse(v[0]));
  }

  saveAll(items: any[]) {
    // clear old cache
    this.sqlite.run('DELETE FROM sidebar_items');

    items.forEach(item => {
      this.sqlite.run(
        'INSERT INTO sidebar_items (payload) VALUES (?)',
        [JSON.stringify(item)]
      );
    });
  }
}
