import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderService } from '../../services/loader.service';
@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="loader.loading$ | async" class="loader-backdrop">
      <div class="loader"></div>
    </div>
  `,
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent {
  constructor(public loader: LoaderService) {}
}
