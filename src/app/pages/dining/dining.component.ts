import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TableStatusService } from '../../services/table-status.service';
import { TablePreferenceService } from '../../services/table-preferences.sevice';
import { LoaderService } from '../../services/loader.service';
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
  currentPage = 0;
  pageSize = 2;

  timers: { [id: string]: string } = {};
  occupiedTables = new Set<string>();

  private subs: Subscription[] = [];
  private timerInterval: any;

  constructor(
    private router: Router,
    private tableStatus: TableStatusService,
    private tablePreferenceService: TablePreferenceService,
    private loader: LoaderService
  ) {}


  ngOnInit(): void {
    this.loadSections();
    this.loadActiveTables();

    this.timerInterval = setInterval(() => {
      this.timers = this.tableStatus.getAllTimers();
    }, 1000);

    const sub = this.tableStatus.occupiedTables$.subscribe(set => {
      this.occupiedTables = new Set(set);
    });

    this.subs.push(sub);
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    clearInterval(this.timerInterval);
  }


  hasTables(): boolean {
    return this.tablesBySection.length > 0;
  }

  get pagedSections() {
    const start = this.currentPage * this.pageSize;
    return this.tablesBySection.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.tablesBySection.length / this.pageSize);
  }

  prevPage() {
    if (this.currentPage > 0) this.currentPage--;
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) this.currentPage++;
  }

  goToSettings() {
    this.router.navigate(['settings/table-preferences']);
  }

  loadSections() {
    this.loader.show();

    this.tablePreferenceService.getAll().subscribe({
      next: (res: any[]) => {
        this.sections = res;

        this.tablesBySection = res.map(sec => ({
          name: sec.name,
          tables: Array.from(
            { length: sec.tableCount },
            (_, i) => `${sec.name}-T${i + 1}`
          )
        }));

        this.currentPage = 0;
      },
      error: () => {
        this.sections = [];
        this.tablesBySection = [];
      },
      complete: () => this.loader.hide()
    });
  }


  loadActiveTables() {
    this.loader.show();

    const sub = this.tableStatus.loadActiveTables().subscribe({
      next: states => {
        console.log('ACTIVE TABLES:', states);

        states.forEach(s => {
          this.tableStatus.markOccupied(s.tableId, s.startTime);
        });

        this.timers = this.tableStatus.getAllTimers();
      },
      error: err => console.error('LOAD TABLE STATE FAILED', err),
      complete: () => this.loader.hide()
    });

    this.subs.push(sub);
  }

  isOccupied(tableId: string): boolean {
    return this.occupiedTables.has(tableId);
  }

  getTimer(id: string): string {
    return this.cleanTimer(this.timers[id]);
  }

  cleanTimer(raw?: string): string {
    if (!raw) return '';
    const mins = parseInt(raw.split('m')[0], 10);
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }

  openOrders(table: string, section: string) {
    this.router.navigate(['dashboard/orders', table, section]);
  }

  getDisplayName(id: string): string {
    return id.split('-T')[1];
  }
}
