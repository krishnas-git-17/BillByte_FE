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

  categories = ['All', 'Breakfast', 'Lunch', 'Starters', 'Beverages', 'Desserts'];
  selectedCategory = 'All';
  vegOnly = false;

  menu = [
    { id: 1, name: 'Paneer Curry', price: 180, img: '...', category: 'Lunch', veg: true },
    { id: 2, name: 'Chicken Biryani', price: 220, img: '...', category: 'Lunch', veg: false },
    { id: 3, name: 'Veg Manchuria', price: 150, img: '...', category: 'Starters', veg: true },
    { id: 4, name: 'Fried Rice', price: 130, img: '...', category: 'Lunch', veg: true },
  ];

  filteredMenu = [...this.menu];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['quantities']) {
      // FORCE Angular to update bindings
      this.quantities = { ...this.quantities };
    }
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
