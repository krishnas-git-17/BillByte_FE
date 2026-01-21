import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_CONFIG } from '../core/api.config';
import { CompletedOrdersOfflineService } from '../core/offline/completed-orders.offline.service';
import { firstValueFrom } from 'rxjs';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class CompletedOrdersService {

  private base = API_CONFIG.BASE_URL + API_CONFIG.COMPLETED_ORDERS.CREATE;

  constructor(
    private http: HttpClient,
    private offline: CompletedOrdersOfflineService,
    private zone: NgZone
  ) {}

  // ================= SAVE =================
saveOrder(order: any) {

  // 🔥 Always save offline first
  this.offline.add(order, false);

  // ========== OFFLINE ==========
  if (!navigator.onLine) {
    return of({
      invoiceNo: null,          // invoice will be generated on sync
      offline: true
    });
  }

  // ========== ONLINE ==========
  return this.http.post<any>(this.base, order).pipe(
    tap(res => {
      // update offline record as synced
      order.invoiceNo = res.invoiceNo;
    })
  );
}

getAll() {
  // ========== OFFLINE ==========
  if (!navigator.onLine) {
    return of(this.offline.getAll());
  }

  // ========== ONLINE ==========
  return this.http.get<any[]>(
    API_CONFIG.BASE_URL + API_CONFIG.COMPLETED_ORDERS.GET_ALL
  ).pipe(
    tap(serverOrders => {
      // 🔥 Replace offline with latest server snapshot
      this.offline.clearAll();
      serverOrders.forEach(o => this.offline.add(o, true));
    })
  );
}
  getByInvoice(invoiceNo: string) {
    return this.http.get<any>(
      API_CONFIG.BASE_URL +
      API_CONFIG.COMPLETED_ORDERS.GET_BY_INVOICE(invoiceNo)
    );
  }

  // ================= SYNC =================
  async syncWithServer() {

    // 1️⃣ PUSH LOCAL → SERVER
    const pending = this.offline.unsynced();

    for (const p of pending) {
      const res = await firstValueFrom(
        this.http.post<any>(this.base, p.payload)
      );
      this.offline.markSynced(p.id, res.invoiceNo);
    }

    // 2️⃣ PULL SERVER SNAPSHOT
    const serverRows = await firstValueFrom(
      this.http.get<any[]>(
        API_CONFIG.BASE_URL + API_CONFIG.COMPLETED_ORDERS.GET_ALL
      )
    );

    // 3️⃣ REPLACE OFFLINE
    this.offline.clearAll();
    serverRows.forEach(o => {
      this.offline.add(o, true);
    });
  }
}
