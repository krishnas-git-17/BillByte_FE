import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_CONFIG } from '../core/api.config';
import { TablePreferenceOfflineService } from './table-preference.offline.service';
import { Observable, of } from 'rxjs';
import { tap, mapTo } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class TablePreferenceService {

  constructor(
    private http: HttpClient,
    private offline: TablePreferenceOfflineService
  ) {}

  getAll(): Observable<any[]> {
    const local = this.offline.getAll();
    if (local.length) {
      return of(local);
    }

    return this.http.get<any[]>(
      API_CONFIG.BASE_URL + API_CONFIG.TABLE_PREFERENCES.GET_ALL
    ).pipe(
      tap(data => data.forEach(x => this.offline.upsert(x, true)))
    );
  }

  create(data: any[]): Observable<boolean> {
    data.forEach(x => this.offline.upsert(x, false));

    const apiPayload = data.map(({ id, ...rest }) => rest);

    if (!navigator.onLine) {
      return of(true);
    }

    return this.http.post(
      API_CONFIG.BASE_URL + API_CONFIG.TABLE_PREFERENCES.CREATE,
      apiPayload
    ).pipe(
      tap(() => data.forEach(x => this.offline.markSynced(x.id))),
      mapTo(true)
    );
  }

  update(id: number, data: any): Observable<boolean> {
    this.offline.upsert({ ...data, id }, false);

    if (!navigator.onLine) {
      return of(true);
    }

    const { id: _, ...apiPayload } = data;

    return this.http.put(
      API_CONFIG.BASE_URL + API_CONFIG.TABLE_PREFERENCES.UPDATE(id),
      apiPayload
    ).pipe(
      tap(() => this.offline.markSynced(id)),
      mapTo(true)
    );
  }

  delete(id: number): Observable<boolean> {
    this.offline.delete(id);

    if (!navigator.onLine) {
      return of(true);
    }

    return this.http.delete(
      API_CONFIG.BASE_URL + API_CONFIG.TABLE_PREFERENCES.DELETE(id)
    ).pipe(
      mapTo(true)
    );
  }
}
