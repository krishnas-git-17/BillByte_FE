import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_CONFIG } from '../core/api.config';

@Injectable({ providedIn: 'root' })
export class SidebarService {
  constructor(private http: HttpClient) {}

  getSidebarItems() {
    return this.http.get<any[]>(
      API_CONFIG.BASE_URL + '/sidebar'
    );
  }
}
