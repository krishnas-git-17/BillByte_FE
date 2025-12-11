import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_CONFIG } from '../core/api.config';

@Injectable({
  providedIn: 'root'
})
export class MenuItemsService {

  private BASE = API_CONFIG.BASE_URL;

  constructor(private http: HttpClient) {}

 getAll() {
  return this.http.get<any[]>(this.BASE + API_CONFIG.MENU.GET_ALL);
}


  createMenuItem(data: any) {
    return this.http.post(this.BASE + API_CONFIG.MENU.CREATE, data);
  }

  updateMenuItem(id: string, data: any) {
    return this.http.put(this.BASE + API_CONFIG.MENU.UPDATE(id), data);
  }

  deleteMenuItem(id: string) {
    return this.http.delete(this.BASE + API_CONFIG.MENU.DELETE(id));
  }

  getMenuItem(id: string) {
    return this.http.get(this.BASE + API_CONFIG.MENU.GET_BY_ID(id));
  }
}
