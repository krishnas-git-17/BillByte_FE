import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_CONFIG } from '../core/api.config';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SignupService {

  constructor(private http: HttpClient) {}

  getPlans(): Observable<any[]> {
    return this.http.get<any[]>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.PLANS.GET_ALL}`
    );
  }

  signup(data: {
    restaurantName: string;
    email: string;
    password: string;
    planId: number;
  }): Observable<any> {
    return this.http.post(
      `${API_CONFIG.BASE_URL}${API_CONFIG.AUTH.SIGNUP}`,
      data
    );
  }
  verifyEmail(data: { email: string; otp: string }) {
  return this.http.post(
    `${API_CONFIG.BASE_URL}${API_CONFIG.AUTH.VERIFY_EMAIL}`,
    data
  );
}

}
