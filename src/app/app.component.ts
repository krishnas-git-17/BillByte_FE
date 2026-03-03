import { Component, OnInit } from '@angular/core';
import { RealtimeService } from './core/signalrsevices/realtime.service';
import { RouterOutlet } from '@angular/router';
import { SyncService } from '../sync.service';
import { TableStatusService } from './services/table-status.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`
})
export class AppComponent {

constructor(
  private sync: SyncService,
  private tableStatus: TableStatusService
) {}

ngOnInit() {
  this.sync.onOnline(async () => {
    await this.tableStatus.syncWithServer();
  });
}


//   ngOnInit(): void {
//    const token = localStorage.getItem('token');
// if (token) {
//   this.realtime.connect(token);
// }

//   }
}
