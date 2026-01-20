import { Injectable } from '@angular/core';
import { fromEvent } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SyncService {

  private isSyncing = false;

  onOnline(cb: () => Promise<void> | void) {
    fromEvent(window, 'online').subscribe(() => {
      if (this.isSyncing) return;
      this.isSyncing = true;

      Promise.resolve(cb()).finally(() => {
        this.isSyncing = false;
      });
    });
  }
}
