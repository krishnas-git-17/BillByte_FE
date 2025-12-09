import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-menu-item-add',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './menu-item-add.component.html',
  styleUrls: ['./menu-item-add.component.scss']
})
export class MenuItemAddComponent {

  @Output() close = new EventEmitter();
  @Output() save = new EventEmitter<any>();

  foodTypes = ['Breakfast', 'Lunch', 'Starters', 'Beverages', 'Desserts'];

  model = {
    menuId: 'M' + Math.floor(1000 + Math.random() * 9000),
    name: '',
    type: '',
    vegType: 'Veg',
    status: 'Available',
     price: null,
    image: null as File | null
  };

  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) this.model.image = file;
  }

  saveItem() {
    this.save.emit(this.model);
  }
}
