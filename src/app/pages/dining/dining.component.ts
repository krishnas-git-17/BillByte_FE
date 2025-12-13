import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TableStatusService } from '../../services/table-status.service';
import { ReportsComponent } from '../reports/reports.component';

interface Section {
  name: string;
  tableCount: number;
}

@Component({
  selector: 'app-dining',
  standalone: true,
  imports: [CommonModule, ReportsComponent],
  templateUrl: './dining.component.html',
  styleUrl: './dining.component.scss'
})
export class DiningComponent implements OnInit, OnDestroy {

  sections: Section[] = [];
  tablesBySection: { name: string; tables: string[] }[] = [];

  timers: { [id: string]: string } = {};
  private intervalId: any;

  constructor(
    private router: Router,
    private tableStatus: TableStatusService
  ) {}

  ngOnInit(): void {
    this.loadSections();

    this.timers = this.tableStatus.getAllTimers();
    this.intervalId = setInterval(() => {
      this.timers = this.tableStatus.getAllTimers();
    }, 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }

  /* ---------------- LOAD FROM LOCAL STORAGE ---------------- */
  loadSections() {
    const data = localStorage.getItem('table_preferences');
    if (!data) return;

    this.sections = JSON.parse(data);

    this.tablesBySection = this.sections.map(sec => ({
      name: sec.name,
      tables: Array.from(
        { length: sec.tableCount },
        (_, i) => `${sec.name}-T${i + 1}`
      )
    }));
  }

  /* ---------------- HELPERS ---------------- */
  getTimer(id: string): string {
    return this.cleanTimer(this.timers[id]);
  }

  cleanTimer(raw: string | undefined): string {
    if (!raw) return '';
    const mins = parseInt(raw.split('m')[0], 10);
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }

  isOccupied(id: string) {
    return this.tableStatus.getStatus(id) === 'occupied';
  }

  openOrders(table: string, section: string) {
    this.router.navigate(['dashboard/orders', table, section]);
  }

  getDisplayName(id: string): string {
    return id.split('-T')[1];
  }
}
