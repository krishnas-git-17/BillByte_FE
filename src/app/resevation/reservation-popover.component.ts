import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';

type TableStatus =
  | 'available'
  | 'occupied'
  | 'ordered'
  | 'billing'
  | 'reservation';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reservation-popover.component.html',
  styleUrls: ['./reservation-popover.component.scss']
})
export class ReservationPopoverComponent implements OnChanges {

  @Input() sections: any[] = [];

  // 🔥 NEW: table status map
  @Input() tableStatusMap: Record<string, TableStatus> = {};

  @Output() reserved = new EventEmitter<string>();

  selectedSection: any;
  tables: string[] = [];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['sections'] && this.sections?.length) {
      this.selectSection(this.sections[0]);
    }
  }

  selectSection(section: any) {
    this.selectedSection = section;

    this.tables = Array.from(
      { length: section.tableCount },
      (_, i) => `${section.name}-T${i + 1}`
    );
  }

isDisabled(tableId: string): boolean {
  const status = this.tableStatusMap[tableId];
  return status !== undefined && status !== 'available';
}


  reserve(tableId: string) {
    if (this.isDisabled(tableId)) return;
    this.reserved.emit(tableId);
  }
}
