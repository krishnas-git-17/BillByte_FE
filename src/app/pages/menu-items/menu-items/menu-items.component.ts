import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuItemAddComponent } from '../menu-item-add.component';

@Component({
  selector: 'app-menu-items',
  standalone: true,
  imports: [CommonModule, FormsModule, MenuItemAddComponent],
  templateUrl: './menu-items.component.html',
  styleUrls: ['./menu-items.component.scss']
})
export class MenuItemsComponent implements OnInit {

  searchText = '';
  items: any[] = [];
  showAddPopup = false;

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems() {
    const data = localStorage.getItem('menu_items');
    this.items = data ? JSON.parse(data) : [];
  }

  saveNewItem(data: any) {
    const list = JSON.parse(localStorage.getItem("menu_items") || "[]");
    list.push(data);
    localStorage.setItem("menu_items", JSON.stringify(list));

    

    this.loadItems();
    this.showAddPopup = false;
  }

  deleteItem(item: any) {
  const list = JSON.parse(localStorage.getItem("menu_items") || "[]");

  const updated = list.filter((x: any) => x.menuId !== item.menuId);

  localStorage.setItem("menu_items", JSON.stringify(updated));

  this.items = updated; // refresh UI
}

}
