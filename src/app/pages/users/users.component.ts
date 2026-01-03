import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersService } from '../../services/users.service';
import { HttpClient } from '@angular/common/http';
import { API_CONFIG } from '../../core/api.config';

@Component({
  standalone: true,
  selector: 'app-users',
  imports: [CommonModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {

  users: any[] = [];
  sections: any[] = [];
  loading = true;

  // Assign tables modal state
  assigningUser: any = null;
  selectedSections: number[] = [];

  roleMap: Record<number, string> = {
    1: 'Owner',
    2: 'Admin',
    3: 'Cashier',
    4: 'Waiter'
  };

  constructor(
    private usersService: UsersService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadUsers();
    this.loadSections();
  }

  /* =======================
     USERS
     ======================= */

  loadUsers() {
    this.usersService.getAll().subscribe({
      next: res => {
        this.users = res;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Users load failed', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openCreate() {
    const name = prompt('Enter name');
    const role = Number(prompt('Role: 1-Owner 2-Admin 3-Cashier 4-Waiter'));

    if (!name || !role) return;

    this.usersService.create({ name, role }).subscribe(res => {
      alert(
        `User Created\n\nEmployee ID: ${res.employeeId}\nPassword: ${res.password}`
      );
      this.loadUsers();
    });
  }

  toggle(user: any) {
    const confirmMsg = user.isActive
      ? 'Disable this user?'
      : 'Enable this user?';

    if (!confirm(confirmMsg)) return;

    this.usersService
      .updateStatus(user.id, !user.isActive)
      .subscribe(() => {
        user.isActive = !user.isActive;
        this.cdr.detectChanges();
      });
  }

  /* =======================
     TABLE SECTIONS
     ======================= */

  loadSections() {
    this.http
      .get<any[]>(API_CONFIG.BASE_URL + API_CONFIG.TABLE_PREFERENCES.GET_ALL)
      .subscribe(res => {
        this.sections = res;
      });
  }

  /* =======================
     ASSIGN TABLES (MODAL)
     ======================= */
openAssign(user: any) {
  this.assigningUser = user;
  this.selectedSections = [];

  // 🔹 Admin / Owner → no assignments
  if (user.role === 1 || user.role === 2) {
    this.selectedSections = [];
    return;
  }

  // 🔹 Load assigned sections for staff
  this.usersService
    .getAssignedTables(user.employeeId)
    .subscribe({
      next: ids => {
        this.selectedSections = ids || [];
        this.cdr.detectChanges();
      },
      error: () => {
        // ✅ IMPORTANT: ignore error, treat as empty
        this.selectedSections = [];
        this.cdr.detectChanges();
      }
    });
}


  closeAssign() {
    this.assigningUser = null;
    this.selectedSections = [];
  }

  toggleSection(id: number) {
    if (this.selectedSections.includes(id)) {
      this.selectedSections = this.selectedSections.filter(x => x !== id);
    } else {
      this.selectedSections.push(id);
    }
  }

  saveAssignment() {
    if (!this.assigningUser) return;

    this.usersService.assignTables({
      employeeId: this.assigningUser.employeeId,
      tablePreferenceIds: this.selectedSections
    }).subscribe(() => {
      alert('Tables assigned successfully');
      this.closeAssign();
    });
  }
}
