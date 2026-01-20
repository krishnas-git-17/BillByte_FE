import { Injectable } from '@angular/core';
import { SqliteService } from './sqlite.service';
import { MenuItem } from '../../models/menu-item.model';

@Injectable({ providedIn: 'root' })
export class MenuItemsOfflineService {

  constructor(private sqlite: SqliteService) {}

  getAll(): MenuItem[] {
  const res = this.sqlite.query(
  `SELECT menuId, name, type, vegType, status, price, imageUrl
   FROM menu_items
   WHERE status = 'Available'
   ORDER BY name`
);


    if (!res.length) return [];

  return res[0].values.map((r): MenuItem => ({
  menuId: String(r[0]),
  name: String(r[1]),
  type: String(r[2]),
  vegType: String(r[3]),
  status: String(r[4]),
  price: Number(r[5]),
  imageUrl: r[6] ? String(r[6]) : null
}));

  }

  upsert(item: MenuItem, synced = true) {
    this.sqlite.run(
      `INSERT OR REPLACE INTO menu_items
       (menuId, name, type, vegType, status, price, imageUrl, updatedAt, synced)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.menuId,
        item.name,
        item.type,
        item.vegType,
        item.status,
        item.price,
        item.imageUrl ?? null,
        new Date().toISOString(),
        synced ? 1 : 0
      ]
    );
  }

  bulkUpsert(items: MenuItem[]) {
    items.forEach(i => this.upsert(i, true));
  }
}
