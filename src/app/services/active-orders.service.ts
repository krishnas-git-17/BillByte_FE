import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_CONFIG } from '../core/api.config';
import { Observable } from 'rxjs';
import { ActiveOrdersOfflineService } from '../core/offline/active-orders.offline.service';

/* =======================
   FRONTEND DTOs (REQUEST)
   ======================= */

/**
 * Used ONLY for add/update requests
 * restaurantId & tableId are resolved in backend
 */
export interface ActiveOrderItemDto {
  itemId: number;
  itemName: string;
  price: number;
  qty: number;
}

/* =======================
   RESPONSE MODELS
   ======================= */

export interface ActiveOrderItem {
  restaurantId: number;
  tableId: string;
  itemId: number;
  itemName: string;
  price: number;
  qty: number;
}

export interface ActiveOrder {
  tableId: string;
  createdAt: string;
  items: ActiveOrderItem[];
}

@Injectable({ providedIn: 'root' })
export class ActiveOrdersService {

  private BASE = API_CONFIG.BASE_URL;

  constructor(private http: HttpClient,   private offline: ActiveOrdersOfflineService) {}

getByTable(tableId: string) {
  if (!navigator.onLine) {
    return this.offline.getByTable(tableId);
  }

  this.http.get<ActiveOrderItem[]>(
    this.BASE + API_CONFIG.ACTIVE_TABLE_ITEMS.GET_BY_TABLE(tableId)
  ).subscribe(items => {
    items.forEach(i => this.offline.addOrUpdate(tableId, i, true));
  });

  return this.offline.getByTable(tableId);
}


addItem(tableId: string, item: ActiveOrderItemDto): void {
  // 🔥 local first
  this.offline.addOrUpdate(tableId, item);

  if (!navigator.onLine) return;

  this.http.post(
    this.BASE + API_CONFIG.ACTIVE_TABLE_ITEMS.ADD_ITEM(tableId),
    item
  ).subscribe(() => {
    this.offline.markSynced(tableId, item.itemId);
  });
}


updateItemQty(tableId: string, itemId: number, qty: number): void {
  this.offline.updateQty(tableId, itemId, qty);

  if (!navigator.onLine) return;

  this.http.put(
    this.BASE + API_CONFIG.ACTIVE_TABLE_ITEMS.UPDATE_ITEM(tableId, itemId),
    { qty }
  ).subscribe(() => {
    this.offline.markSynced(tableId, itemId);
  });
}


deleteItem(tableId: string, itemId: number): void {
  this.offline.remove(tableId, itemId);

  if (!navigator.onLine) return;

  this.http.delete(
    this.BASE + API_CONFIG.ACTIVE_TABLE_ITEMS.DELETE_ITEM(tableId, itemId)
  ).subscribe();
}

clearTable(tableId: string): void {
  this.offline.clearTable(tableId);

  if (!navigator.onLine) return;

  this.http.delete(
    this.BASE + API_CONFIG.ACTIVE_TABLE_ITEMS.CLEAR_TABLE(tableId)
  ).subscribe();
}

}