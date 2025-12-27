import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RealtimeService {

  private hub?: signalR.HubConnection;

  // Generic event stream
  private event$ = new Subject<{ type: string; payload: any }>();
  events$ = this.event$.asObservable();

  connect(token: string) {
    // ✅ prevent duplicate connections
    if (this.hub && this.hub.state === signalR.HubConnectionState.Connected) {
      return;
    }

    this.hub = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7117/hubs/pos', {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .build();

    this.hub.on('RealtimeEvent', (event) => {
      this.event$.next(event);
    });

    this.hub.start()
      .then(() => console.log('[Realtime] Connected'))
      .catch(err => console.error('[Realtime] Connection failed', err));
  }

  disconnect() {
    if (this.hub) {
      this.hub.stop();
      this.hub = undefined;
    }
  }
}
