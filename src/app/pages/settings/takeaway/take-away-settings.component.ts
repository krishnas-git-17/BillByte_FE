import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  standalone: true,
  selector: 'app-take-away-settings',
  imports: [FormsModule, MatCheckboxModule],
  templateUrl: './take-away-settings.component.html',
})
export class TakeAwaySettingsComponent {

  settings = {
    parcel: true,
    zomato: false,
    swiggy: false
  };

  constructor() {
    const saved = localStorage.getItem('takeaway_settings');
    if (saved) this.settings = JSON.parse(saved);
  }

  save() {
    localStorage.setItem('takeaway_settings', JSON.stringify(this.settings));
    alert('Take Away settings saved');
  }
}
