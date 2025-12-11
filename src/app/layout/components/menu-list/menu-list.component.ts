import { Component, EventEmitter, Output, Input, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuItemsService } from '../../../services/menu-items.service';
import { LoaderService } from '../../../services/loader.service';

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
export class MenuListComponent implements OnInit, OnChanges {

  @Input() quantities: { [id: number]: number } = {};
  @Output() quantityChange = new EventEmitter<{ item: MenuItem; qty: number }>();

  selectedCategory = 'All';
  vegOnly = false;

  menu: any[] = [];
  filteredMenu: any[] = [];

  allCategories: string[] = [];       // all from API
  visibleCategories: string[] = [];   // first 5 + "All"
  showMore = false;

  constructor(
    private menuService: MenuItemsService,
    private loader: LoaderService
  ) {}

  ngOnInit() {
    this.loadMenuFromApi();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['quantities']) {
      this.quantities = { ...this.quantities };
      this.applyFilters();
    }
  }

  loadMenuFromApi() {
    this.loader.show();

    this.menuService.getAll().subscribe({
      next: (res: any[]) => {
        this.menu = res.map((item, index) => ({
          id: index + 1,
          menuId: item.menuId,
          name: item.name,
          price: item.price || 0,
          img: item.imageUrl || null,
          category: item.type,
          veg: item.vegType === "Veg",
          status: item.status
        }));

        this.buildCategoryList();
        this.applyFilters();
      },
      error: () => {
        console.error("Failed to load menu");
      },
      complete: () => {
        this.loader.hide();
      }
    });
  }

  // Build categories from API by frequency, highest first
  buildCategoryList() {
    const countMap: Record<string, number> = {};

    this.menu.forEach(item => {
      const cat = item.category || 'Others';
      countMap[cat] = (countMap[cat] || 0) + 1;
    });

    const sorted = Object.keys(countMap).sort((a, b) => countMap[b] - countMap[a]);

    this.allCategories = ['All', ...sorted];      // keep All at top
    this.visibleCategories = this.allCategories.slice(0, 6); // "All" + top 5
  }

  toggleMore(event: MouseEvent) {
    event.stopPropagation();
    this.showMore = !this.showMore;
  }

  closeMore() {
    this.showMore = false;
  }

  selectCategory(cat: string) {
    this.selectedCategory = cat;
    this.applyFilters();
    this.closeMore();
  }

  applyFilters() {
    let temp = this.menu.filter(m => {
      const categoryMatch =
        this.selectedCategory === 'All' || m.category === this.selectedCategory;

      const vegMatch = !this.vegOnly || m.veg === true;

      return categoryMatch && vegMatch;
    });

    // Selected items first
    this.filteredMenu = [
      ...temp.filter(m => (this.quantities[m.id] || 0) > 0),
      ...temp.filter(m => (this.quantities[m.id] || 0) === 0)
    ];
  }

  increaseQty(item: any) {
    const updatedQty = (this.quantities[item.id] || 0) + 1;
    this.quantityChange.emit({ item, qty: updatedQty });
  }

  decreaseQty(item: any) {
    const updatedQty = Math.max((this.quantities[item.id] || 0) - 1, 0);
    this.quantityChange.emit({ item, qty: updatedQty });
  }

  resetQuantity(id: number) {
    this.quantities[id] = 0;
    this.applyFilters();
  }
}
