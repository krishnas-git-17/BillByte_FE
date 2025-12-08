import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-menu-items',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './menu-items.component.html',
  styleUrls: ['./menu-items.component.scss']
})
export class MenuItemsComponent implements OnInit {

  items: any[] = [];

  constructor() {}

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems() {
    const data = localStorage.getItem('menu-items');
    this.items = data ? JSON.parse(data) : [];
  }

  addRow() {
    const nextCode = 'MI' + String(this.items.length + 1).padStart(3, '0');

    this.items.push({
      si: this.items.length + 1,
      code: nextCode,
      name: '',
      type: '',
      veg: true,
      price: '',
      photo: '',
      tempImage: null, // store local file
      isNew: true
    });
  }

  onFileSelect(event: any, row: any) {
    const file = event.target.files[0];
    if (!file) return;

    // Create temporary preview URL
    const reader = new FileReader();
    reader.onload = () => {
      row.photo = reader.result;  // store base64 preview
    };
    reader.readAsDataURL(file);
  }

  saveRow(row: any) {
    row.isNew = false;
    localStorage.setItem('menu-items', JSON.stringify(this.items));
    alert("Item Saved!");
  }

  deleteRow(i: number) {
    this.items.splice(i, 1);
    localStorage.setItem('menu_items', JSON.stringify(this.items));
  }
}
