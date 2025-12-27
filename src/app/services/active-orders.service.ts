import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_CONFIG } from '../core/api.config';
import { Observable } from 'rxjs';

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

  constructor(private http: HttpClient) {}

  /* =======================
     GET ACTIVE ORDER BY TABLE
     ======================= */
  getByTable(tableId: string): Observable<ActiveOrderItem[]> {
    return this.http.get<ActiveOrderItem[]>(
      this.BASE + API_CONFIG.ACTIVE_TABLE_ITEMS.GET_BY_TABLE(tableId)
    );
  }

  /* =======================
     ADD ITEM (REAL-TIME)
     ======================= */
  addItem(tableId: string, item: ActiveOrderItemDto): Observable<any> {
    return this.http.post(
      this.BASE + API_CONFIG.ACTIVE_TABLE_ITEMS.ADD_ITEM(tableId),
      item
    );
  }

  /* =======================
     UPDATE ITEM QTY
     ======================= */
  updateItemQty(
    tableId: string,
    itemId: number,
    qty: number
  ): Observable<any> {
    return this.http.put(
      this.BASE + API_CONFIG.ACTIVE_TABLE_ITEMS.UPDATE_ITEM(tableId, itemId),
      { qty }
    );
  }

  /* =======================
     DELETE ITEM
     ======================= */
  deleteItem(tableId: string, itemId: number): Observable<any> {
    return this.http.delete(
      this.BASE + API_CONFIG.ACTIVE_TABLE_ITEMS.DELETE_ITEM(tableId, itemId)
    );
  }

  /* =======================
     CLEAR TABLE (LATER USE)
     ======================= */
  clearTable(tableId: string): Observable<any> {
    return this.http.delete(
      this.BASE + API_CONFIG.ACTIVE_TABLE_ITEMS.CLEAR_TABLE(tableId)
    );
  }
}
