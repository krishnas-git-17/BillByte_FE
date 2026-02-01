import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router, UrlTree } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(private router: Router) {}

  private checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
      return this.router.createUrlTree(['/login']);
    }
    return true;
  }

  canActivate() {
    return this.checkAuth();
  }

  canActivateChild() {
    return this.checkAuth();
  }
}

