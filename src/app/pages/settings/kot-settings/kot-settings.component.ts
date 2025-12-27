import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-kot-settings',
  imports: [CommonModule, FormsModule],
  templateUrl: './kot-settings.component.html',
  styleUrls: ['./kot-settings.component.scss']
})
export class KotSettingsComponent {

  settings = {
    showLogo: true,
    showRestaurantName: true,
    showAddress: true,
    showGST: false,
    showDateTime: true,
    showTable: true,
    showOrderType: true,
    showItemNotes: true,
    groupSameItems: true,
    showSubtotal: true,
    showTax: true,
    showGrandTotal: true
  };

  save() {
    localStorage.setItem('kot_settings', JSON.stringify(this.settings));
    alert('KOT / Bill settings saved');
  }
}
