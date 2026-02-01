import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private TOKEN_KEY = 'token';
  private ROLE_KEY = 'role';

  setLogin(token: string, role: string) {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.ROLE_KEY, role);
  }

  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRole() {
    return localStorage.getItem(this.ROLE_KEY);
  }

  isLoggedIn() {
    return !!this.getToken();
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  }

  getRestaurantId(): string | null {
  const token = this.getToken();
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.restaurantId ?? null;
  } catch {
    return null;
  }
}

}


