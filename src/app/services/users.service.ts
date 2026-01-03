import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_CONFIG } from '../core/api.config';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UsersService {

  private base = API_CONFIG.BASE_URL + API_CONFIG.USERS.GET_ALL;

  constructor(private http: HttpClient) {}

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.base);
  }

  create(payload: {
    name: string;
    email?: string;
    role: number;
  }): Observable<{ employeeId: string; password: string }> {
    return this.http.post<any>(
      API_CONFIG.BASE_URL + API_CONFIG.USERS.CREATE,
      payload
    );
  }

  updateStatus(id: number, isActive: boolean) {
    return this.http.patch(
      API_CONFIG.BASE_URL + API_CONFIG.USERS.UPDATE_STATUS(id),
      isActive
    );
  }
getAssignedTables(employeeId: string) {
  return this.http.get<number[]>(
    API_CONFIG.BASE_URL +
    API_CONFIG.ASSIGN_TABLES.GET_BY_EMPLOYEE(employeeId)
  );
}

assignTables(payload: {
  employeeId: string;
  tablePreferenceIds: number[];
}) {
  return this.http.post(
    API_CONFIG.BASE_URL +
      API_CONFIG.ASSIGN_TABLES.CREATE,
    payload
  );
}


}
