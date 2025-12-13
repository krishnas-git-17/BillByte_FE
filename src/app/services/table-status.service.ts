import { Injectable, NgZone } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TableStatusService {

  private STATUS_KEY = 'table_status';
  private TIMER_KEY = 'table_timers';
  private ORDER_KEY = 'table_orders';

  private liveTimers: { [id: string]: string } = {};
  private interval: any;

  constructor(private zone: NgZone) {
    this.startGlobalTimer();
  }

  // ---------- ORDER SAVE / LOAD ----------
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

  // ---------- STATUS (GREEN / ORANGE) ----------
  getStatus(id: string): 'available' | 'occupied' {
    const map = JSON.parse(localStorage.getItem(this.STATUS_KEY) || '{}');
    return map[id] || 'available';
  }

  setStatus(id: string, status: 'available' | 'occupied') {
    const map = JSON.parse(localStorage.getItem(this.STATUS_KEY) || '{}');
    map[id] = status;
    localStorage.setItem(this.STATUS_KEY, JSON.stringify(map));
  }

  // ---------- TIMERS (START / STOP) ----------
  private loadTimers(): { [id: string]: number } {
    return JSON.parse(localStorage.getItem(this.TIMER_KEY) || '{}');
  }

  private saveTimers(map: { [id: string]: number }) {
    localStorage.setItem(this.TIMER_KEY, JSON.stringify(map));
  }

  startTimer(id: string) {
    const timers = this.loadTimers();
    timers[id] = Date.now();
    this.saveTimers(timers);
  }

  stopTimer(id: string) {
    const timers = this.loadTimers();
    delete timers[id];
    this.saveTimers(timers);
    delete this.liveTimers[id];
  }

  getElapsedMinutes(tableId: string): number {
  const timers = JSON.parse(localStorage.getItem(this.TIMER_KEY) || '{}');

  if (!timers[tableId]) return 0;

  const diffMs = Date.now() - timers[tableId];
  return Math.floor(diffMs / 60000); // minutes
}

  // ---------- GLOBAL TICKER (EVERY 1 SEC) ----------
  private startGlobalTimer() {
    if (this.interval) return;

    this.interval = setInterval(() => {
      this.zone.run(() => {
        const timers = this.loadTimers();

        Object.keys(timers).forEach(tableId => {
          const diffSec = Math.floor((Date.now() - timers[tableId]) / 1000);
          this.liveTimers[tableId] = this.format(diffSec);
        });
      });
    }, 1000);
  }

  private format(sec: number): string {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  }

  // ---------- PUBLIC GETTERS ----------
  getAllTimers() {
    return { ...this.liveTimers };
  }

  getTimer(id: string) {
    return this.liveTimers[id];
  }
}
