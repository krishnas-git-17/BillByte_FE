import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { API_CONFIG } from '../core/api.config';
  import { tap } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';
import { RealtimeService } from '../core/signalrsevices/realtime.service';
import { TableStateOfflineService } from '../core/offline/table-state.offline.service';

type TableStatus =
  | 'available'
  | 'occupied'
  | 'ordered'
  | 'billing'
  | 'reservation';

@Injectable({ providedIn: 'root' })
export class TableStatusService {

  private selectedSection = 'ALL';

  private statusMap = new Map<string, TableStatus>();
  private tableState$ = new BehaviorSubject<Map<string, TableStatus>>(new Map());
  private timers$ = new BehaviorSubject<{ [id: string]: string }>({});


  private liveTimers: { [id: string]: number } = {};
  private uiTimers: { [id: string]: string } = {};
  private interval: any;
  private restoreFromOffline() {
  const rows = this.offline.getAll();

  rows.forEach(r => {
    this.setTableState(r.tableId, r.status, r.startTime);
  });
}


  constructor(
    private http: HttpClient,
    private zone: NgZone,
    private realtime: RealtimeService,
    private offline: TableStateOfflineService
  ) {
    this.startGlobalTimer();
    this.listenRealtime();
  }

  setSelectedSection(section: string) {
    this.selectedSection = section;
  }

  getSelectedSection(): string {
    return this.selectedSection;
  }

  watchTableStates() {
    return this.tableState$.asObservable();
  }
  watchTimers() {
  return this.timers$.asObservable();
}


initFromOffline() {
  const rows = this.offline.getAll();

  rows.forEach(r => {
    this.setTableState(r.tableId, r.status, r.startTime);
  });
}

loadActiveTables(): Observable<any[]> {
  // ========== OFFLINE ==========
  if (!navigator.onLine) {
    const local = this.offline.getAll();

    // 🔥 Apply offline state to UI
    this.zone.run(() => {
      local.forEach(r => {
        this.setTableState(r.tableId, r.status, r.startTime);
      });
    });

    return new Observable(obs => {
      obs.next(local);
      obs.complete();
    });
  }

  // ========== ONLINE ==========
  return this.http.get<any[]>(
    API_CONFIG.BASE_URL + API_CONFIG.TABLE_STATE.GET_ALL
  ).pipe(
    tap(rows => {
      this.zone.run(() => {
        rows.forEach(r => {
          this.setTableState(r.tableId, r.status, r.startTime);
          this.offline.upsert(r.tableId, r.status, r.startTime, true);
        });
      });
    })
  );
}




setOccupied(tableId: string) {
  const startTime = new Date().toISOString();

  // 🔥 INSTANT UI
  this.setTableState(tableId, 'occupied', startTime);

  // 🔥 SAVE OFFLINE
  this.offline.upsert(tableId, 'occupied', startTime);

  if (!navigator.onLine) return;

  this.http.post(
    API_CONFIG.BASE_URL + API_CONFIG.TABLE_STATE.OCCUPIED(tableId),
    {}
  ).subscribe(() => {
    this.offline.markSynced(tableId);
  });
}

setOrdered(tableId: string) {
  this.setTableState(tableId, 'ordered');

  this.offline.upsert(tableId, 'ordered');

  if (!navigator.onLine) return;

  this.http.post(
    API_CONFIG.BASE_URL + `/table-state/ordered/${tableId}`,
    {}
  ).subscribe(() => {
    this.offline.markSynced(tableId);
  });
}

setBilling(tableId: string) {
  this.setTableState(tableId, 'billing');

  this.offline.upsert(tableId, 'billing');

  if (!navigator.onLine) return;

  this.http.post(
    API_CONFIG.BASE_URL + `/table-state/billing/${tableId}`,
    {}
  ).subscribe(() => {
    this.offline.markSynced(tableId);
  });
}


setReservation(tableId: string) {
  this.setTableState(tableId, 'reservation');

  this.offline.upsert(tableId, 'reservation');

  if (!navigator.onLine) return;

  this.http.post(
    API_CONFIG.BASE_URL + `/table-state/reservation/${tableId}`,
    {}
  ).subscribe(() => {
    this.offline.markSynced(tableId);
  });
}


resetTable(tableId: string) {
  this.setTableState(tableId, 'available');

  this.offline.remove(tableId);

  if (!navigator.onLine) return;

  this.http.post(
    API_CONFIG.BASE_URL + API_CONFIG.TABLE_STATE.RESET(tableId),
    {}
  ).subscribe();
}


  setTableState(tableId: string, status: TableStatus, startTime?: string) {
    this.statusMap.set(tableId, status);
    this.tableState$.next(new Map(this.statusMap));

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

private listenRealtime() {
  this.realtime.events$.subscribe(event => {
    if (event.type === 'TABLE_STATUS_CHANGED') {
      const { tableId, status, startTime } = event.payload;

      this.zone.run(() => {
        this.setTableState(tableId, status, startTime);
        this.offline.upsert(tableId, status, startTime, true);
      });
    }
  });
}


  private startGlobalTimer() {
    if (this.interval) return;

    this.interval = setInterval(() => {
      this.zone.run(() => {
        let changed = false;

        Object.keys(this.liveTimers).forEach(id => {
          this.liveTimers[id]++;
          this.uiTimers[id] = this.format(this.liveTimers[id]);
          changed = true;
        });

        if (changed) {
          this.timers$.next({ ...this.uiTimers });
        }
      });
    }, 1000);
  }


  private initTimer(tableId: string, startTime: string) {
    const diffSec =
      Math.floor((Date.now() - new Date(startTime).getTime()) / 1000);
    this.liveTimers[tableId] = diffSec;
    this.uiTimers[tableId] = this.format(diffSec);
    this.timers$.next({ ...this.uiTimers });
  }


  getAllTimers() {
    return { ...this.uiTimers };
  }

  private format(sec: number): string {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  }
  async syncWithServer() {

  // ========= STEP 1: PUSH LOCAL → SERVER =========
  const pending = this.offline.unsynced();

  for (const p of pending) {
    let req;

    switch (p.status) {
      case 'occupied':
        req = this.http.post(
          API_CONFIG.BASE_URL + API_CONFIG.TABLE_STATE.OCCUPIED(p.tableId), {}
        );
        break;

      case 'ordered':
        req = this.http.post(
          API_CONFIG.BASE_URL + `/table-state/ordered/${p.tableId}`, {}
        );
        break;

      case 'billing':
        req = this.http.post(
          API_CONFIG.BASE_URL + `/table-state/billing/${p.tableId}`, {}
        );
        break;

      case 'reservation':
        req = this.http.post(
          API_CONFIG.BASE_URL + `/table-state/reservation/${p.tableId}`, {}
        );
        break;

      default:
        continue;
    }

    await firstValueFrom(req);
    this.offline.markSynced(p.tableId);
  }

  // ========= STEP 2: PULL SERVER SNAPSHOT =========
  const serverRows = await firstValueFrom(
    this.http.get<any[]>(
      API_CONFIG.BASE_URL + API_CONFIG.TABLE_STATE.GET_ALL
    )
  );

  // ========= STEP 3: REPLACE OFFLINE =========
  this.offline.clearAll();

  serverRows.forEach(r => {
    this.offline.upsert(
      r.tableId,
      r.status,
      r.startTime,
      true
    );
  });

  // ========= STEP 4: UPDATE UI =========
  this.zone.run(() => {
    this.statusMap.clear();
    serverRows.forEach(r => {
      this.setTableState(r.tableId, r.status, r.startTime);
    });
  });
}
}
