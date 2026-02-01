import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { API_CONFIG } from '../core/api.config';
import { RealtimeService } from '../core/signalrsevices/realtime.service';

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

  constructor(
    private http: HttpClient,
    private zone: NgZone,
    private realtime: RealtimeService
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

  setOrdered(tableId: string) {
    return this.http.post(
      API_CONFIG.BASE_URL + `/table-state/ordered/${tableId}`,
      {}
    );
  }

  setBilling(tableId: string) {
  return this.http.post(
    API_CONFIG.BASE_URL + `/table-state/billing/${tableId}`,
    {}
  );
}

  setReservation(tableId: string) {
    return this.http.post(
      API_CONFIG.BASE_URL + `/table-state/reservation/${tableId}`,
      {}
    );
  }

  resetTable(tableId: string) {
    return this.http.post(
      API_CONFIG.BASE_URL + API_CONFIG.TABLE_STATE.RESET(tableId),
      {}
    );
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
}
