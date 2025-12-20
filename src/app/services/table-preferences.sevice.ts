import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_CONFIG } from '../core/api.config';

@Injectable({ providedIn: 'root' })
export class TablePreferenceService {

  constructor(private http: HttpClient) {}

  getAll() {
  return this.http.get<any[]>(
    API_CONFIG.BASE_URL + API_CONFIG.TABLE_PREFERENCES.GET_ALL
  );
}


  create(data: any[]) {
    return this.http.post(
      API_CONFIG.BASE_URL + API_CONFIG.TABLE_PREFERENCES.CREATE,
      data
    );
  }

  update(id: number, data: any) {
    return this.http.put(
      API_CONFIG.BASE_URL + API_CONFIG.TABLE_PREFERENCES.UPDATE(id),
      data
    );
  }

  delete(id: number) {
    return this.http.delete(
      API_CONFIG.BASE_URL + API_CONFIG.TABLE_PREFERENCES.DELETE(id)
    );
  }
}
