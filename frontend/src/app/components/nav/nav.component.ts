import { Component } from '@angular/core';
import { SharedModule } from '../../shared.module';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [SharedModule, RouterModule],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css'
})
export class NavComponent {
  searchQuery: string = '';

  constructor(private router: Router) {}

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/fyp'], { queryParams: { search: this.searchQuery } });
    }
  }

  navigateToPosts(): void {
    this.router.navigate(['/fyp']);
  }

  // Navigate to create post
  navigateToCreatePost(): void {
    this.router.navigate(['/create-post']);
  }

  // Handle logout
  onLogout(): void {
    // Add your logout logic here (e.g., clear tokens, redirect to login)
    localStorage.removeItem('authToken');
    this.router.navigate(['/login']);
  }  
}
