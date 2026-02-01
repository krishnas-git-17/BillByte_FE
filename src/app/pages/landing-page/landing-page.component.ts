import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

/**
 * Landing Page Component - Optimized UI/UX
 * 
 * Modern, responsive landing page with:
 * - Sticky navbar with scroll detection
 * - Hero section with engaging content
 * - Features showcase with cards
 * - About section with detailed information
 * - CTA sections throughout
 * - Smooth animations and transitions
 * - Mobile-first responsive design
 */
@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent {
  mobileMenuOpen = false;
  scrolled = false;

  constructor(private router: Router) {}

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.scrolled = window.scrollY > 20;
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  navigateToLogin(): void {
    this.closeMobileMenu();
    this.router.navigate(['/login']);
  }

  openSignUp(): void {
    this.closeMobileMenu();
    alert('Sign Up page coming soon');
  }

  scrollToSection(sectionId: string): void {
    this.closeMobileMenu();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /**
   * Smooth scroll to about section
   */
  scrollToAbout(): void {
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  /**
   * Show table detail (for demo purposes)
   */
  showTableDetail(tableNumber: number): void {
    console.log(`Showing details for table ${tableNumber}`);
    // In a real implementation, this would update the detail view
    const detailCard = document.querySelector('.table-detail-card');
    if (detailCard) {
      detailCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      detailCard.classList.add('active');
      setTimeout(() => {
        detailCard.classList.remove('active');
      }, 600);
    }
  }
}
