import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  standalone: true,
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  imports: [MatIconModule, MatCardModule]
})
export class SettingsComponent {
  constructor(private router: Router) {}

  openMenuImages() {
    this.router.navigate(['/settings/menu-images']);
  }
  openAppPreferences() {
    this.router.navigate(['/settings/table-preferences']); 
  }
  openKotSettings() {
  this.router.navigate(['/settings/kot-settings']);
}
openTakeAwaySettings() {
  this.router.navigate(['/settings/take-away-settings']);
}


}
