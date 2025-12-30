import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_CONFIG } from '../core/api.config';

@Injectable({ providedIn: 'root' })
export class MenuItemImageService {

  private BASE = API_CONFIG.BASE_URL;

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<any[]>(
      this.BASE + API_CONFIG.MENU_IMAGE.GET_ALL
    );
  }

  create(data: any) {
    return this.http.post(
      this.BASE + API_CONFIG.MENU_IMAGE.CREATE,
      data
    );
  }

  getById(id: number) {
    return this.http.get(
      this.BASE + API_CONFIG.MENU_IMAGE.GET_BY_ID(id)
    );
  }

  update(id: number, data: any) {
    return this.http.put(
      this.BASE + API_CONFIG.MENU_IMAGE.UPDATE(id),
      data
    );
  }

  delete(id: number) {
    return this.http.delete(
      this.BASE + API_CONFIG.MENU_IMAGE.DELETE(id)
    );
  }
}

