import { Component, EventEmitter, Output, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface MenuItem {
  id: number;
  name: string;
  price: number;
}

@Component({
  selector: 'app-menu-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './menu-list.component.html',
  styleUrl: './menu-list.component.scss'
})
export class MenuListComponent implements OnChanges {

  @Input() quantities: { [id: number]: number } = {};
  @Output() quantityChange = new EventEmitter<{ item: MenuItem; qty: number }>();

  categories = ['All', 'Breakfast', 'Lunch', 'Starters', 'Beverages', 'Desserts', 'Dinner', 'Snacks'];
  selectedCategory = 'All';
  vegOnly = false;

  menu: any[] = [];
  filteredMenu: any[] = [];

  ngOnInit() {
    this.loadMenuFromStorage();
    this.applyFilters();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['quantities']) {
      this.quantities = { ...this.quantities };
    }
  }

  loadMenuFromStorage() {
    const data = JSON.parse(localStorage.getItem("menu_items") || "[]");

    this.menu = data.map((item: any, index: number) => ({
      id: index + 1,
      menuId: item.menuId,
      name: item.name,
      price: item.price || 0,
      img: item.image || null,
      category: item.type,
      veg: item.vegType === "Veg"
    }));

    this.filteredMenu = [...this.menu];
  }

  selectCategory(cat: string) {
    this.selectedCategory = cat;
    this.applyFilters();
  }

  applyFilters() {
    this.filteredMenu = this.menu.filter(m => {
      const categoryMatch = this.selectedCategory === 'All' || m.category === this.selectedCategory;
      const vegMatch = !this.vegOnly || m.veg === true;
      return categoryMatch && vegMatch;
    });
  }

  increaseQty(item: MenuItem) {
    const updatedQty = (this.quantities[item.id] || 0) + 1;
    this.quantityChange.emit({ item, qty: updatedQty });
  }

  decreaseQty(item: MenuItem) {
    const updatedQty = Math.max((this.quantities[item.id] || 0) - 1, 0);
    this.quantityChange.emit({ item, qty: updatedQty });
  }

  resetQuantity(id: number) {
    this.quantities[id] = 0;
  }
}
