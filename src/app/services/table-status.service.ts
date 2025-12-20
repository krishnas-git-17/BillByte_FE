import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { API_CONFIG } from '../core/api.config';

@Injectable({ providedIn: 'root' })
export class TableStatusService {

  private ORDER_KEY = 'table_orders';

  private liveTimers: { [id: string]: number } = {};
  private uiTimers: { [id: string]: string } = {};
  private interval: any;

  private occupiedTablesSubject = new BehaviorSubject<Set<string>>(new Set());
  occupiedTables$ = this.occupiedTablesSubject.asObservable();

  constructor(
    private http: HttpClient,
    private zone: NgZone
  ) {
    this.startGlobalTimer();
  }

  saveOrder(tableId: string, data: any) {
    const all = JSON.parse(localStorage.getItem(this.ORDER_KEY) || '{}');
    all[tableId] = data;
    localStorage.setItem(this.ORDER_KEY, JSON.stringify(all));
  }

  loadOrder(tableId: string) {
    const all = JSON.parse(localStorage.getItem(this.ORDER_KEY) || '{}');
    return all[tableId] || null;
  }

  clearOrder(tableId: string) {
    const all = JSON.parse(localStorage.getItem(this.ORDER_KEY) || '{}');
    delete all[tableId];
    localStorage.setItem(this.ORDER_KEY, JSON.stringify(all));
  }

  startTable(tableId: string): Observable<any> {
    return this.http.post(
      API_CONFIG.BASE_URL + API_CONFIG.TABLE_STATE.START(tableId),
      {}
    );
  }

  stopTable(tableId: string): Observable<any> {
    return this.http.post(
      API_CONFIG.BASE_URL + API_CONFIG.TABLE_STATE.STOP(tableId),
      {}
    );
  }

  loadActiveTables(): Observable<any[]> {
    return this.http.get<any[]>(
      API_CONFIG.BASE_URL + API_CONFIG.TABLE_STATE.GET_ALL
    );
  }

  markOccupied(tableId: string, startTime: string) {
    const set = new Set(this.occupiedTablesSubject.value);
    set.add(tableId);
    this.occupiedTablesSubject.next(set);

    this.initTimer(tableId, startTime);
  }

  markAvailable(tableId: string) {
    const set = new Set(this.occupiedTablesSubject.value);
    set.delete(tableId);
    this.occupiedTablesSubject.next(set);

    delete this.liveTimers[tableId];
    delete this.uiTimers[tableId];
  }

  isOccupied(tableId: string): boolean {
    return this.occupiedTablesSubject.value.has(tableId);
  }

  initTimer(tableId: string, startTime: string) {
    const diffSec = Math.floor(
      (Date.now() - new Date(startTime).getTime()) / 1000
    );
    this.liveTimers[tableId] = diffSec;
    this.uiTimers[tableId] = this.format(diffSec);
  }

  getAllTimers() {
    return { ...this.uiTimers };
  }

  getTimer(id: string) {
    return this.uiTimers[id];
  }

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

  private format(sec: number): string {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  }
}
