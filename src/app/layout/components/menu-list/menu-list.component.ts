import { Component, EventEmitter, Output, Input, OnChanges, SimpleChanges, OnInit,ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuItemsService } from '../../../services/menu-items.service';
import { LoaderService } from '../../../services/loader.service';
import { IMAGES } from '../../../shared/image.constants';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

export interface MenuItem {
  id: number;
  name: string;
  price: number;
}

@Component({
  selector: 'app-menu-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './menu-list.component.html',
  styleUrls: ['./menu-list.component.scss']
})
export class MenuListComponent implements OnInit, OnChanges {
  @Input() quantities: { [id: number]: number } = {};
  @Input() cartCount: number = 0;
  @Input() searchText: string = "";
  @Output() quantityChange = new EventEmitter<{ item: MenuItem; qty: number }>();
  @Input() disabled = false;
  @ViewChild('catScroll') catScroll: any;

  selectedCategory = 'All';
  vegOnly = false;

  menu: any[] = [];
  filteredMenu: any[] = [];
  loadingMenu = true; 
  skeletonMenu = Array.from({ length: 12 });
  allCategories: string[] = [];
  visibleCategories: string[] = [];
  extraCategories: string[] = [];
  showMore = false;

  constructor(
    private menuService: MenuItemsService,
    private loader: LoaderService,
    private router: Router,
    private cdr: ChangeDetectorRef 
  ) { }

  ngOnInit() {
    this.loadMenuFromApi();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['searchText']) {
      this.applyFilters();
    }

    if (changes['quantities']) {
       this.quantities = { ...this.quantities };
      this.applyFilters();
    }
  }
  applySearch(text: string) {
    text = text.toLowerCase();

    this.filteredMenu = this.menu.filter(m =>
      m.name.toLowerCase().includes(text) ||
      m.type.toLowerCase().includes(text)
    );
  }

scrollLeft() {
  this.catScroll.nativeElement.scrollBy({ left: -200, behavior: 'smooth' });
}

scrollRight() {
  this.catScroll.nativeElement.scrollBy({ left: 200, behavior: 'smooth' });
}
 loadMenuFromApi() {
  this.loadingMenu = true;

  this.menuService.getAll().subscribe({
    next: (res: any[]) => {
      this.menu = res.map((item, index) => ({
        id: index + 1,
        menuId: item.menuId,
        name: item.name,
        price: item.price || 0,
        img: item.imageUrl && item.imageUrl !== ""
          ? item.imageUrl
          : IMAGES.MENU_THUMBNAIL,
        category: item.type || 'Others',
        veg: item.vegType === "Veg",
        status: item.status
      }));

      this.buildCategoryList();
      this.applyFilters();
      this.loadingMenu = false;

      this.cdr.detectChanges(); // ✅ FORCE UI REFRESH
    },
    error: () => {
      this.loadingMenu = false;
      this.cdr.detectChanges(); // ✅
    }
  });
}

  openAddMenu() {
    this.router.navigate(['/menu-items']);
  }
  buildCategoryList() {
    const countMap: Record<string, number> = {};

    this.menu.forEach(item => {
      const cat = item.category || 'Others';
      countMap[cat] = (countMap[cat] || 0) + 1;
    });

    const sorted = Object.keys(countMap).sort((a, b) => countMap[b] - countMap[a]);

    this.allCategories = ['All', ...sorted];

    this.visibleCategories = this.allCategories.slice(0, 6);

    this.extraCategories = this.allCategories.slice(6);
  }

  toggleMore() {
    this.showMore = !this.showMore;
    console.log('toggleMore ->', this.showMore);
  }

  selectCategory(cat: string) {
    this.selectedCategory = cat;
    this.applyFilters();
  }

  applyFilters() {
    const text = this.searchText.toLowerCase();

    this.filteredMenu = this.menu.filter(m => {
      const searchMatch =
        !text || m.name.toLowerCase().includes(text) || m.category.toLowerCase().includes(text);

      const categoryMatch =
        this.selectedCategory === 'All' ||
        m.category === this.selectedCategory;

      const vegMatch =
        !this.vegOnly || m.veg === true;

      return searchMatch && categoryMatch && vegMatch;
    });

    this.filteredMenu = [
      ...this.filteredMenu.filter(m => (this.quantities[m.id] || 0) > 0),
      ...this.filteredMenu.filter(m => (this.quantities[m.id] || 0) === 0)
    ];
  }

  increaseQty(item: any) {
    if (this.disabled) {
    return; 
  }
    const updatedQty = (this.quantities[item.id] || 0) + 1;
    this.quantityChange.emit({ item, qty: updatedQty });
  }

  decreaseQty(item: any) {
     if (this.disabled) {
    return; 
  }
    const updatedQty = Math.max((this.quantities[item.id] || 0) - 1, 0);
    this.quantityChange.emit({ item, qty: updatedQty });
  }

  resetQuantity(id: number) {
    this.quantities[id] = 0;
    this.applyFilters();
  }
}
