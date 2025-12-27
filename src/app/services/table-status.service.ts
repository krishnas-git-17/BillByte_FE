import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../core/api.config';
import { RealtimeService } from '../core/signalrsevices/realtime.service';

type TableStatus = 'available' | 'occupied' | 'ordered' | 'billing';

@Injectable({ providedIn: 'root' })

export class TableStatusService {
 private selectedSection = 'ALL';
  constructor(
    private http: HttpClient,
    private zone: NgZone,
    private realtime: RealtimeService
  ) {
    this.startGlobalTimer();
    this.listenRealtime();
  }

  /* ================= API ================= */
 setSelectedSection(section: string) {
    this.selectedSection = section;
  }

  getSelectedSection(): string {
    return this.selectedSection;
  }

  loadActiveTables(): Observable<any[]> {
    return this.http.get<any[]>(
      API_CONFIG.BASE_URL + API_CONFIG.TABLE_STATE.GET_ALL
    );
  }

  setOccupied(tableId: string) {
    return this.http.post(
      API_CONFIG.BASE_URL + API_CONFIG.TABLE_STATE.OCCUPIED(tableId),
      {}
    );
  }

  sendKOT(tableId: string) {        // 🔥 MAIN METHOD
    return this.http.post(
      API_CONFIG.BASE_URL + API_CONFIG.TABLE_STATE.KOT(tableId),
      {}
    );
  }

  resetTable(tableId: string) {
    return this.http.post(
      API_CONFIG.BASE_URL + API_CONFIG.TABLE_STATE.RESET(tableId),
      {}
    );
  }

  /* ================= STATE ================= */

  private statusMap = new Map<string, TableStatus>();

  setTableState(tableId: string, status: TableStatus, startTime?: string) {
    this.statusMap.set(tableId, status);

    if (status !== 'available' && startTime) {
      this.initTimer(tableId, startTime);
    } else {
      delete this.liveTimers[tableId];
      delete this.uiTimers[tableId];
    }
  }

  getStatus(tableId: string): TableStatus {
    return this.statusMap.get(tableId) || 'available';
  }

  setOrdered(tableId: string) {
  return this.http.post(
    API_CONFIG.BASE_URL + `/table-state/ordered/${tableId}`,
    {}
  );
}

// setBilling(tableId: string) {
//   return this.http.post(
//     API_CONFIG.BASE_URL + `/table-state/billing/${tableId}`,
//     {}
//   );
// }

  /* ================= REALTIME ================= */

  private listenRealtime() {
    this.realtime.events$.subscribe(event => {
      if (event.type === 'TABLE_STATUS_CHANGED') {
        const { tableId, status, startTime } = event.payload;
        this.setTableState(tableId, status, startTime);
      }
    });
  }

  /* ================= TIMER ================= */

  private liveTimers: { [id: string]: number } = {};
  private uiTimers: { [id: string]: string } = {};
  private interval: any;

  private startGlobalTimer() {
    if (this.interval) return;

    this.interval = setInterval(() => {
      this.zone.run(() => {
        Object.keys(this.liveTimers).forEach(id => {
          this.liveTimers[id]++;
          this.uiTimers[id] = this.format(this.liveTimers[id]);
        });
      });
    }, 1000);
  }

  private initTimer(tableId: string, startTime: string) {
    const diffSec =
      Math.floor((Date.now() - new Date(startTime).getTime()) / 1000);

    this.liveTimers[tableId] = diffSec;
    this.uiTimers[tableId] = this.format(diffSec);
  }

  getAllTimers() {
    return { ...this.uiTimers };
  }

  private format(sec: number): string {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  }
}
