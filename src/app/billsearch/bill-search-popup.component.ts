import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bill-search-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bill-search-popup.component.html',
  styleUrls: ['./bill-search-popup.component.scss']
})
export class BillSearchPopupComponent {
  @Input() order: any;
  formatTime(minutes: number): string {
  if (!minutes || minutes <= 0) return '00:00';

  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${hrs.toString().padStart(2, '0')}:${mins
    .toString()
    .padStart(2, '0')}`;
}

}
