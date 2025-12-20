import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_CONFIG } from '../core/api.config';

@Injectable({ providedIn: 'root' })
export class CompletedOrdersService {

  private base = API_CONFIG.BASE_URL + API_CONFIG.COMPLETED_ORDERS.CREATE;

  constructor(private http: HttpClient) {}

  saveOrder(order: any) {
    return this.http.post(this.base, order);
  }

  getAll() {
  return this.http.get<any[]>(API_CONFIG.BASE_URL + API_CONFIG.COMPLETED_ORDERS.GET_ALL);
}

}
