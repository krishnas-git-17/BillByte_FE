import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { API_CONFIG } from '../../core/api.config';
import { SqliteService } from '../../core/offline/sqlite.service';
@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private sqliteService: SqliteService 
  ) {}

  async login() {
    if (!this.email || !this.password) {
      this.error = 'Email and password required';
      return;
    }

    this.loading = true;
    this.error = '';

  this.http.post<any>(
  `${API_CONFIG.BASE_URL}/auth/login`,
  {
    email: this.email,
    password: this.password
  }
).subscribe({
  next: async (res) => {   // ✅ MAKE THIS ASYNC
    localStorage.setItem('token', res.token);
    localStorage.setItem('role', res.role);
    localStorage.setItem('email', res.email);

    // ✅ NOW THIS IS VALID
    await this.sqliteService.init();

    this.router.navigate(['/dashboard']);
  },
  error: () => {
    this.error = 'Invalid credentials';
    this.loading = false;
  },
  complete: () => this.loading = false
});

  }
}
