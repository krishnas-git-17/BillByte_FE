import { Component, OnInit } from '@angular/core';
import { RealtimeService } from './core/signalrsevices/realtime.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`
})
export class AppComponent implements OnInit {

  constructor(private realtime: RealtimeService) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.realtime.connect(token);
    }
  }
}
