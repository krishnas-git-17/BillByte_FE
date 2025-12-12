import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_CONFIG } from '../core/api.config';

@Injectable({
  providedIn: 'root'
})
export class MenuItemImageService {

  private BASE = API_CONFIG.BASE_URL;

  constructor(private http: HttpClient) {}

  // Get all images
  getAll() {
    return this.http.get<any[]>(this.BASE + API_CONFIG.MENU_IMAGE.GET_ALL);
  }

  // Create new image
  create(data: any) {
    return this.http.post(this.BASE + API_CONFIG.MENU_IMAGE.CREATE, data);
  }

  // Get image by ID
  getById(id: string) {
    return this.http.get(this.BASE + API_CONFIG.MENU_IMAGE.GET_BY_ID(id));
  }

  // Update image
  update(id: string, data: any) {
    return this.http.put(this.BASE + API_CONFIG.MENU_IMAGE.UPDATE(id), data);
  }

  // Delete image
  delete(id: string) {
    return this.http.delete(this.BASE + API_CONFIG.MENU_IMAGE.DELETE(id));
  }
}
