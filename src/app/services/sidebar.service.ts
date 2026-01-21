import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_CONFIG } from '../core/api.config';
import { SidebarOfflineService } from '../core/offline/sidebar.offline.service';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class SidebarService {

  constructor(
    private http: HttpClient,
    private offline: SidebarOfflineService
  ) {}

  getSidebarItems() {
    const cached = this.offline.getAll();

    if (cached.length && !navigator.onLine) {
      return of(cached);
    }

    return this.http.get<any[]>(
      API_CONFIG.BASE_URL + '/sidebar'
    ).pipe(
      tap(items => this.offline.saveAll(items))
    );
  }
}
