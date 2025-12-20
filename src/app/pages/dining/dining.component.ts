import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TableStatusService } from '../../services/table-status.service';
import { TablePreferenceService } from '../../services/table-preferences.sevice';
import { LoaderService } from '../../services/loader.service';
import { ReportsComponent } from '../reports/reports.component';
import { CompletedOrdersService } from '../../services/completed-orders.service';
import { FormsModule } from '@angular/forms';

interface Section {
  name: string;
  tableCount: number;
}

@Component({
  selector: 'app-dining',
  standalone: true,
  imports: [CommonModule, ReportsComponent, FormsModule],
  templateUrl: './dining.component.html',
  styleUrl: './dining.component.scss'
})
export class DiningComponent implements OnInit, OnDestroy {

  orderTrendPercent = 0;
  orderTrendDirection: 'up' | 'down' | 'same' = 'same';
  topItemsRange: 'today' | 'week' | 'month' = 'today';
  yesterdayOrders = 0;
  yesterdayPercent = 0;
  todayPercent = 0;

  totalOrders = 0;
  totalRevenue = 0;
  activeTables = 0;
  topItems: any[] = [];

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
    private loader: LoaderService,
    private completedOrders: CompletedOrdersService,
    private cdr: ChangeDetectorRef
  ) { }


  ngOnInit(): void {
    this.loadSections();
    this.loadActiveTables();
    this.loadTodayReports();

    this.timerInterval = setInterval(() => {
      this.timers = this.tableStatus.getAllTimers();
    }, 1000);

    const sub = this.tableStatus.occupiedTables$.subscribe(set => {
      this.occupiedTables = new Set(set);
      this.activeTables = set.size;
    });


    this.subs.push(sub);
  }

  loadTodayReports() {
    this.completedOrders.getAll().subscribe((orders: any[]) => {
      this.calculateTodaySummary(orders);
      this.cdr.detectChanges();
    });
  }

  goToReports() {
    this.router.navigate(['/reports']);
  }


  calculateTodaySummary(orders: any[]) {
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const todayOrders = orders.filter(o =>
      new Date(o.createdDate) >= today && o.total > 0
    );

    const yesterdayOrders = orders.filter(o =>
      new Date(o.createdDate) >= yesterday &&
      new Date(o.createdDate) < today &&
      o.total > 0
    );

    this.totalOrders = todayOrders.length;
    this.yesterdayOrders = yesterdayOrders.length;

    const max = Math.max(this.totalOrders, this.yesterdayOrders) || 1;
    this.todayPercent = (this.totalOrders / max) * 100;
    this.yesterdayPercent = (this.yesterdayOrders / max) * 100;

    this.totalRevenue = todayOrders.reduce((s, o) => s + o.total, 0);

    let startDate = new Date(today);

    if (this.topItemsRange === 'week') {
      startDate.setDate(today.getDate() - 6);
    }

    if (this.topItemsRange === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const rangeOrders = orders.filter(o =>
      new Date(o.createdDate) >= startDate && o.total > 0
    );

    const itemMap = new Map<string, number>();

    rangeOrders.forEach(order => {
      order.items.forEach((item: any) => {
        itemMap.set(
          item.itemName,
          (itemMap.get(item.itemName) || 0) + item.qty
        );
      });
    });

    this.topItems = Array.from(itemMap.entries())
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    if (this.yesterdayOrders > 0) {
      this.orderTrendPercent =
        ((this.totalOrders - this.yesterdayOrders) / this.yesterdayOrders) * 100;

      if (this.orderTrendPercent > 0) this.orderTrendDirection = 'up';
      else if (this.orderTrendPercent < 0) this.orderTrendDirection = 'down';
      else this.orderTrendDirection = 'same';
    } else {
      this.orderTrendPercent = 100;
      this.orderTrendDirection = 'up';
    }
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
