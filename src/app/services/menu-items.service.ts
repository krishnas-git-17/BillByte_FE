import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_CONFIG } from '../core/api.config';
import { MenuItem } from '../models/menu-item.model';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { MenuItemsOfflineService } from '../core/offline/menu-items.offline.service';

@Injectable({ providedIn: 'root' })
export class MenuItemsService {

  private BASE = API_CONFIG.BASE_URL;

constructor(
  private http: HttpClient,
  private offline: MenuItemsOfflineService
) {}

getAll(): Observable<MenuItem[]> {

  // 🔥 OFFLINE FIRST
  if (!navigator.onLine) {
    const local = this.offline.getAll();
    return new Observable(obs => {
      obs.next(local);
      obs.complete();
    });
  }

  // 🔥 ONLINE → CACHE → UI
  return this.http.get<MenuItem[]>(
    this.BASE + API_CONFIG.MENU.GET_ALL
  ).pipe(
    tap(items => {
      this.offline.bulkUpsert(items);
    })
  );
}

  createMenuItem(data: MenuItem) {
    return this.http.post(
      this.BASE + API_CONFIG.MENU.CREATE,
      data
    );
  }

  updateMenuItem(id: string, data: Partial<MenuItem>) {
    return this.http.put(
      this.BASE + API_CONFIG.MENU.UPDATE(id),
      data
    );
  }

  deleteMenuItem(id: string) {
    return this.http.delete(
      this.BASE + API_CONFIG.MENU.DELETE(id)
    );
  }

  getMenuItem(id: string) {
    return this.http.get<MenuItem>(
      this.BASE + API_CONFIG.MENU.GET_BY_ID(id)
    );
  }
}
