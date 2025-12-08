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
    // Load current stored timers
    this.timers = this.tableStatus.getAllTimers();

    // Update timers every 1 sec
   this.intervalId = setInterval(() => {
  this.timers = this.tableStatus.getAllTimers();
}, 1000);

  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }

  openOrders(table: string, type: string) {
    this.router.navigate(['/orders', table, type]);
  }

  isOccupied(id: string) {
    return this.tableStatus.getStatus(id) === 'occupied';
  }

  getTimer(id: string) {
    return this.timers[id];
  }

 getDisplayName(id: string): string {
  return id.replace(/^AC-/, '').replace(/^NAC-/, '');
}


}
