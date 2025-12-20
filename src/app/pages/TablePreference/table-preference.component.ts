import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TablePreferenceService } from '../../services/table-preferences.sevice';
import { LoaderService } from '../../services/loader.service';
import Swal from 'sweetalert2';

interface Section {
  id?: number;
  name: string;
  tableCount: number;
}

@Component({
  standalone: true,
  selector: 'app-table-preference',
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './table-preference.component.html',
  styleUrls: ['./table-preference.component.scss']
})
export class TablePreferenceComponent implements OnInit {

  sections: Section[] = [];

  /* ADD SECTION */
  showAddForm = false;
  sectionName = '';
  tableCount: number | null = null;

  /* INLINE EDIT */
  editingIndex: number | null = null;
  editData: Section = { name: '', tableCount: 0 };

  constructor(
    private location: Location,
    private tableService: TablePreferenceService,
    private loader: LoaderService
  ) {}

  ngOnInit(): void {
    this.loadSections(); // ✅ LOAD ON OPEN
  }

  /* ---------------- LOAD ---------------- */
  loadSections() {
    this.loader.show();

    this.tableService.getAll().subscribe({
      next: (res: any) => {
        this.sections = res;
      },
      error: () => this.loader.hide(),
      complete: () => this.loader.hide()
    });
  }

  /* NAV */
  goBack() {
    this.location.back();
  }

  /* ADD SECTION */
  openAddSection() {
    this.sectionName = '';
    this.tableCount = null;
    this.showAddForm = true;
  }

saveSection() {
  if (!this.sectionName || !this.tableCount) return;

  const payload = [{
    name: this.sectionName,
    tableCount: this.tableCount
  }];

  this.loader.show();

  this.tableService.create(payload).subscribe({
    next: () => {
      this.showAddForm = false;
      this.sectionName = '';
      this.tableCount = null;

      this.loadSections(); // ✅ IMPORTANT (brings id)
    },
    error: () => {
      this.loader.hide();
      Swal.fire('Error', 'Failed to add section', 'error');
    },
    complete: () => this.loader.hide()
  });
}


  /* EDIT */
  startEdit(section: Section, index: number) {
    this.editingIndex = index;
    this.editData = { ...section };
  }

 saveInlineEdit(index: number) {
  const section = this.sections[index];

  if (!section.id) return; // 🔒 guard

  this.loader.show();

  this.tableService.update(section.id!, this.editData).subscribe({
    next: () => {
      this.sections[index] = { ...section, ...this.editData };
      this.cancelInlineEdit();
    },
    error: () => {
      this.loader.hide();
      Swal.fire('Error', 'Update failed', 'error');
    },
    complete: () => this.loader.hide()
  });
}


  cancelInlineEdit() {
    this.editingIndex = null;
    this.editData = { name: '', tableCount: 0 };
  }

  /* DELETE */
deleteSection(index: number) {
  const section = this.sections[index];
  if (!section.id) return;

  Swal.fire({
    title: 'Are you sure?',
    text: `Delete "${section.name}"?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, Delete'
  }).then(result => {

    if (!result.isConfirmed) return;

    this.loader.show();

    this.tableService.delete(section.id!).subscribe({
      next: () => {
        this.sections.splice(index, 1);
      },
      error: () => {
        this.loader.hide();
        Swal.fire('Error', 'Delete failed', 'error');
      },
      complete: () => this.loader.hide()
    });
  });
}

}
