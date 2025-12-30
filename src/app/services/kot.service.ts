import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { API_CONFIG } from '../core/api.config';

export interface KotItem {
  itemName: string;
  qty: number;
  specialNote?: string;
}

export interface KotSnapshot {
  id?: number;
  kotNo?: string;          // KOT-REST-YEAR-MM-DD-SEQ
  kotNumber?: number;      // daily sequence (1,2,3…)
  tableId: string;
  createdAt?: string;
  items: KotItem[];
}

@Injectable({ providedIn: 'root' })
export class KotService {

  // 🔴 Live KOT list (for kitchen screen)
  private todayKots$ = new BehaviorSubject<KotSnapshot[]>([]);

  constructor(private http: HttpClient) {}

  // ===============================
  // CREATE KOT (Save & KOT)
  // ===============================
  createKot(payload: {
    tableId: string;
    items: KotItem[];
  }): Observable<KotSnapshot> {
    return this.http.post<KotSnapshot>(
      API_CONFIG.BASE_URL + API_CONFIG.KOT.CREATE,
      payload
    );
  }

  // ===============================
  // LOAD TODAY KOTS (Kitchen screen)
  // ===============================
  loadTodayKots(): void {
    this.http
      .get<KotSnapshot[]>(
        API_CONFIG.BASE_URL + API_CONFIG.KOT.GET_TODAY
      )
      .subscribe({
        next: list => this.todayKots$.next(list),
        error: err => console.error('Failed to load KOTs', err)
      });
  }

  watchTodayKots(): Observable<KotSnapshot[]> {
    return this.todayKots$.asObservable();
  }

  // ===============================
  // GET KOT BY KOT NUMBER (Reprint)
  // ===============================
  getKotByKotNo(kotNo: string): Observable<KotSnapshot> {
    return this.http.get<KotSnapshot>(
      API_CONFIG.BASE_URL + API_CONFIG.KOT.GET_BY_KOT_NO(kotNo)
    );
  }

  // ===============================
  // CLEAR LOCAL STATE (optional)
  // ===============================
  clearLocalKots() {
    this.todayKots$.next([]);
  }
}
