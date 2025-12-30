import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  standalone: true,
  selector: 'app-new-order-popover',
  imports: [CommonModule, MatButtonModule],
  templateUrl: './take-away-popover.component.html',
  styleUrls: ['./take-away-popover.component.scss']
})
export class TakeAwayPopoverComponent {

  @Output() selected = new EventEmitter<string>();

  select(type: string) {
    this.selected.emit(type);
  }
}
