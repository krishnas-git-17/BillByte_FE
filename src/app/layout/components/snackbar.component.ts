import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-snackbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="snackbar" *ngIf="show">
      {{ message }}
    </div>
  `,
  styleUrls: ['./snackbar.component.scss']
})
export class SnackbarComponent {
  @Input() message: string = '';
  @Input() show: boolean = false;
}
