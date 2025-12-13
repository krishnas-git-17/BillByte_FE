import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

interface Section {
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
export class TablePreferenceComponent {

  private readonly STORAGE_KEY = 'table_preferences';

  sections: Section[] = [];

  /* ADD SECTION FORM (UNCHANGED) */
  showAddForm = false;
  sectionName = '';
  tableCount: number | null = null;

  /* INLINE EDIT */
  editingIndex: number | null = null;
  editData: Section = { name: '', tableCount: 0 };

  constructor(private location: Location) {
    this.loadFromStorage(); // ✅ LOAD ON INIT
  }

  /* ---------------- STORAGE ---------------- */
  saveToStorage() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.sections));
  }

  loadFromStorage() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (data) {
      this.sections = JSON.parse(data);
    }
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

    this.sections.push({
      name: this.sectionName,
      tableCount: this.tableCount
    });

    this.saveToStorage(); // ✅ SAVE

    this.showAddForm = false;
    this.sectionName = '';
    this.tableCount = null;
  }

  /* INLINE EDIT */
  startEdit(section: Section, index: number) {
    this.editingIndex = index;
    this.editData = { ...section };
  }

  saveInlineEdit(index: number) {
    this.sections[index] = { ...this.editData };
    this.saveToStorage(); // ✅ UPDATE SAME RECORD
    this.cancelInlineEdit();
  }

  cancelInlineEdit() {
    this.editingIndex = null;
    this.editData = { name: '', tableCount: 0 };
  }

  /* DELETE */
  deleteSection(index: number) {
    this.sections.splice(index, 1);
    this.saveToStorage(); // ✅ SAVE
  }
}
