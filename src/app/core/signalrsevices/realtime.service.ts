import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { API_CONFIG } from '../api.config';

@Injectable({ providedIn: 'root' })
export class RealtimeService {

  private hub?: signalR.HubConnection;
  private event$ = new Subject<{ type: string; payload: any }>();
  events$ = this.event$.asObservable();

  connect(token: string) {
    if (this.hub && this.hub.state === signalR.HubConnectionState.Connected) {
      return;
    }
 const hubUrl = API_CONFIG.BASE_URL.replace('/api', '') + '/posHub';
    this.hub = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .build();

    // ✅ TABLE STATUS
    this.hub.on('TABLE_STATUS_CHANGED', payload => {
      this.event$.next({ type: 'TABLE_STATUS_CHANGED', payload });
    });

    // ✅ ACTIVE TABLE ITEMS
    this.hub.on('ACTIVE_TABLE_ITEMS_CHANGED', payload => {
      this.event$.next({ type: 'ACTIVE_TABLE_ITEMS_CHANGED', payload });
    });

    this.hub.start()
      .then(() => console.log('[Realtime] Connected'))
      .catch(err => console.error('[Realtime] Connection failed', err));
  }

  disconnect() {
    this.hub?.stop();
    this.hub = undefined;
  }
}
