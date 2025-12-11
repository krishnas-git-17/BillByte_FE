import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TableStatusService } from '../../services/table-status.service';
import { ReportsComponent } from '../reports/reports.component';

@Component({
  selector: 'app-dining',
  standalone: true,
  imports: [CommonModule, ReportsComponent],
  templateUrl: './dining.component.html',
  styleUrl: './dining.component.scss'
})
export class DiningComponent implements OnInit, OnDestroy {

  constructor(private router: Router, private tableStatus: TableStatusService) {}

  acTables = Array.from({ length: 24 }, (_, i) => `AC-T${i + 1}`);
  nonAcTables = Array.from({ length: 30 }, (_, i) => `NAC-T${i + 1}`);

  timers: { [id: string]: string } = {};
  private intervalId: any;

  ngOnInit(): void {
    this.timers = this.tableStatus.getAllTimers();

    // update UI every 1 sec
    this.intervalId = setInterval(() => {
      this.timers = this.tableStatus.getAllTimers();
    }, 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }

cleanTimer(raw: string | undefined): string {
  if (!raw) return "";
  const parts = raw.split(" ");
  if (parts.length < 2) return "";
  const minutesStr = parts[0].replace("m", ""); 
  const totalMinutes = parseInt(minutesStr, 10);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }

  return `${mins}m`;
}
  getTimer(id: string): string {
    return this.cleanTimer(this.timers[id]);
  }
  openOrders(table: string, type: string) {
    this.router.navigate(['dashboard/orders', table, type]);
  }
  isOccupied(id: string) {
    return this.tableStatus.getStatus(id) === 'occupied';
  }

  getDisplayName(id: string): string {
    return id.replace(/^AC-/, '').replace(/^NAC-/, '');
  }

}
