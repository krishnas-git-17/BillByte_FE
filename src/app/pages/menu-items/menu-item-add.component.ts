import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SnackbarComponent } from '../../layout/components/snackbar.component'; // <-- ensure correct path

@Component({
  selector: 'app-menu-item-add',
  standalone: true,
  imports: [CommonModule, FormsModule, SnackbarComponent],
  templateUrl: './menu-item-add.component.html',
  styleUrls: ['./menu-item-add.component.scss']
})
export class MenuItemAddComponent {

  @Output() close = new EventEmitter();
  @Output() save = new EventEmitter<any>();

  showSnack = false;
  snackMessage = "";

  foodTypes = ['Breakfast', 'Lunch', 'Starters', 'Beverages', 'Desserts'];

  model = {
    menuId: 'M' + Math.floor(1000 + Math.random() * 9000),
    name: '',
    type: '',
    vegType: 'Veg',
    status: 'Available',
    price: null,
    image: null as string | null
  };

  showSnackbar(msg: string) {
        this.snackMessage = msg;
        this.showSnack = true;

        setTimeout(() => (this.showSnack = false), 2500);
    }

onFileSelect(event: any) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = () => {
    this.model.image = reader.result as string; 
    console.log("Base64 Image:", this.model.image);
  };

  reader.readAsDataURL(file);
}

  saveItem() {

  if (
    !this.model.name.trim() ||
    !this.model.type ||
    !this.model.vegType ||
    !this.model.status ||
    this.model.price === null ||
    this.model.price === "" ||
    Number(this.model.price) <= 0
  ) {
    this.showSnackbar("Please fill all required fields!");
    return;
  }

  this.showSnackbar("Saved successfully!");

  setTimeout(() => {
    const payload = {
      menuId: this.model.menuId,
      name: this.model.name.trim(),
      type: this.model.type,
      vegType: this.model.vegType,
      status: this.model.status,   // ✅ FIX HERE
      price: Number(this.model.price),
      imageUrl: this.model.image || null
    };


    this.save.emit(payload);  // <-- sending correct shape
  }, 500);
}


}
