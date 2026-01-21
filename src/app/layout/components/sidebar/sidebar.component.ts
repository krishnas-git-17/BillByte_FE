import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { SidebarService } from '../../../services/sidebar.service';
import { NetworkStatusService } from '../../../services/network-status.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatIconModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {

  items: any[] = [];
  loading = true;
isOnline = navigator.onLine;

  constructor(
    private sidebarService: SidebarService,
    private cdr: ChangeDetectorRef,   // 🔴 REQUIRED (zoneless)
    private network: NetworkStatusService
  ) {}

  ngOnInit(): void {
     this.network.isOnline$().subscribe(status => {
      this.isOnline = status;
    });
    this.sidebarService.getSidebarItems().subscribe({
      next: res => {
        this.items = res;
        this.loading = false;
        this.cdr.detectChanges(); // 🔴 IMPORTANT
      },
      error: err => {
        console.error('Sidebar API error', err);
        this.loading = false;
        this.cdr.detectChanges(); // 🔴 IMPORTANT
      }
    });
  }
}
