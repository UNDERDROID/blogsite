import { Component, HostListener, OnInit } from '@angular/core';
import { SharedModule } from '../../shared.module';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { NavComponent } from "../nav/nav.component";
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { param } from 'jquery';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { MatCardModule } from '@angular/material/card';
import { debounceTime, Subject } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // Import the spinner module


interface Post {
  id: number;
  title: string;
  content: string;
  creator_name: string;
  created_at: string;
  categories: string;
  tags: string;
  safeContent: SafeHtml;
  isExpanded: boolean;
}

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [
    SharedModule,
    NavComponent,
    SidebarComponent,
    MatCardModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './posts.component.html',
  styleUrl: './posts.component.css'
})
export class PostsComponent implements OnInit {
  posts: any[] = [];
  post = null;
  filteredPosts: any[] = [];
  selectedPost: Post | null=null;
  limit: number = 2;
  offset: number = 0;
  isLoading: boolean = false;
  hasMorePosts: boolean = true; // Add flag to track if more posts are available
  private scrollSubject = new Subject<void>();

  constructor(
    private authService: AuthService, 
    private http: HttpClient, 
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer
  ){}

  ngOnInit(): void {
    this.updateLimitBasedOnScreenSize();

    this.route.queryParams.subscribe(params => {
      const categoryId = params['categoryId'];
      const tagId = params['tagId'];
      const searchQuery = params['search'] || '';

      // Reset hasMorePosts when parameters change
      this.hasMorePosts = true;
      this.refreshPosts(categoryId, tagId, searchQuery);
    });

    // Set up debouncing for scroll events - wait 300ms after scrolling stops
    this.scrollSubject.pipe(
      debounceTime(300)
    ).subscribe(() => {
      this.handleScrollEnd();
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void{
    this.updateLimitBasedOnScreenSize();
    
    // Reset hasMorePosts on resize
    this.hasMorePosts = true;
    this.refreshPosts();
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(): void{
    // Use the scrollSubject for debouncing
    this.scrollSubject.next();
  }

  handleScrollEnd(): void {
    // Only attempt to load more if we're near the bottom, not already loading, and have more posts to load
    const scrollPosition = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    const scrollPercentage = (scrollPosition+windowHeight)/documentHeight;

    if(scrollPercentage >0.85 && 
       !this.isLoading && 
       this.hasMorePosts) {
      this.loadMorePosts();
    }
  }

  updateLimitBasedOnScreenSize(): void{
    const width = window.innerWidth;

    if(width<576){
      this.limit=3;
    }else if(width<992){
      this.limit=6;
    }else if(width <1200){
      this.limit=8;
    }else{
      this.limit=10;
    }
  }

  loadMorePosts():void{
    if (!this.hasMorePosts || this.isLoading) {
      return; // Exit early if no more posts or already loading
    }
    
    this.isLoading = true;

    // Get current route parameters from snapshot
    const params = this.route.snapshot.queryParams;
    const categoryId = params['categoryId'];
    const tagId = params['tagId'];
    const searchQuery = params['search'] || '';

    this.offset += this.limit;

    // Call appropriate method to load more posts
    if (categoryId) {
      this.loadMorePostsByCategory(categoryId, searchQuery);
    } else if (tagId) {
      this.loadMorePostsByTag(tagId, searchQuery);
    } else {
      this.loadMorePostsGeneral(searchQuery);
    }
  }

  loadMorePostsGeneral(searchQuery: string): void {
    this.authService.getPosts(this.limit, this.offset).subscribe(
      (data) => {
        // Check if we received fewer posts than requested or no posts
        if (data.length === 0 || data.length < this.limit) {
          this.hasMorePosts = false;
        }
        
        if (data.length > 0) {
          // Sanitize and add new posts to existing array
          const newPosts = data.map(post => ({
            ...post,
            safeContent: this.sanitizer.bypassSecurityTrustHtml(post.content),
          }));
          this.posts = [...this.posts, ...newPosts];
          this.filterPosts(searchQuery);
        }
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching more posts', error);
        this.isLoading = false;
        // Assume no more posts on error to prevent continuous error requests
        this.hasMorePosts = false;
      }
    );
  }

  loadMorePostsByCategory(categoryId: number, searchQuery: string): void {
    this.updateLimitBasedOnScreenSize();
    this.http.get<any[]>(`http://localhost:5000/api/posts/by-categories?categories=${categoryId}&limit=${this.limit}&offset=${this.offset}`).subscribe(
      (data) => {
        // Check if we received fewer posts than requested or no posts
        if (data.length === 0 || data.length < this.limit) {
          this.hasMorePosts = false;
        }
        
        if (data.length > 0) {
          const newPosts = data.map(post => ({
            ...post,
            safeContent: this.sanitizer.bypassSecurityTrustHtml(post.content),
          }));
          this.posts = [...this.posts, ...newPosts]; // Append new posts
          this.filterPosts(searchQuery);
        }
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching more posts by category', error);
        this.isLoading = false;
        this.hasMorePosts = false;
      }
    );
  }
  
  loadMorePostsByTag(tagId: number, searchQuery: string): void {
    this.http.get<any[]>(`http://localhost:5000/api/posts/by-tags?tags=${tagId}&limit=${this.limit}&offset=${this.offset}`).subscribe(
      (data) => {
        // Check if we received fewer posts than requested or no posts
        if (data.length === 0 || data.length < this.limit) {
          this.hasMorePosts = false;
        }
        
        if (data.length > 0) {
          const newPosts = data.map(post => ({
            ...post,
            safeContent: this.sanitizer.bypassSecurityTrustHtml(post.content),
          }));
          this.posts = [...this.posts, ...newPosts]; // Append new posts
          this.filterPosts(searchQuery);
        } 
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching more posts by tag', error);
        this.isLoading = false;
        this.hasMorePosts = false;
      }
    );
  }

  refreshPosts(categoryId?: number, tagId?: number, searchQuery: string = ''): void {
    this.offset = 0; // Reset offset when changing filters or limit
    this.hasMorePosts = true; // Reset the flag when refreshing posts
    
    if (categoryId) {
      this.fetchPostsByCategory(categoryId, searchQuery);
    } else if (tagId) {
      this.fetchPostsByTag(tagId, searchQuery);
    } else {
      this.fetchPosts(searchQuery);
    }
  }

  fetchPosts(searchQuery: string): void {
    this.isLoading = true;

    this.authService.getPosts(this.limit, this.offset).subscribe(
      (data) => {
        // Check if we received fewer posts than requested
        if (data.length < this.limit) {
          this.hasMorePosts = false;
        }
        
        //Sanitize post content
        this.posts = data.map(post => ({
          ...post,
          safeContent: this.sanitizer.bypassSecurityTrustHtml(post.content),
        }));
        this.filterPosts(searchQuery);
        console.log('fetched post:', data);
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching posts', error);
        this.isLoading = false;
        this.hasMorePosts = false;
      }
    );
  }

  filterPosts(query: string) {
    if (!query.trim()) {
      this.filteredPosts = this.posts;
      return;
    }

    this.filteredPosts = this.posts.filter(post =>
      post.title.toLowerCase().includes(query.toLowerCase()) 
    );
    console.log('Filtered posts:', this.filteredPosts.length);
  }

  fetchPostsByCategory(categoryId: number, searchQuery: string) {
    this.isLoading = true;

    this.http.get<any[]>(`http://localhost:5000/api/posts/by-categories?categories=${categoryId}&limit=${this.limit}&offset=${this.offset}`).subscribe(
      (data) => {
        // Check if we received fewer posts than requested
        if (data.length < this.limit) {
          this.hasMorePosts = false;
        }
        
        this.posts = data.map(post => ({
          ...post,
          safeContent: this.sanitizer.bypassSecurityTrustHtml(post.content),
        }));
        this.filterPosts(searchQuery);
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching posts by category', error);
        this.isLoading = false;
        this.hasMorePosts = false;
      }
    );
  }

  fetchPostsByTag(tagId: number, searchQuery: string) {
    this.isLoading = true;

    this.http.get<any[]>(`http://localhost:5000/api/posts/by-tags?tags=${tagId}&limit=${this.limit}&offset=${this.offset}`).subscribe(
      (data) => {
        // Check if we received fewer posts than requested
        if (data.length < this.limit) {
          this.hasMorePosts = false;
        }
        
        this.posts = data.map(post => ({
          ...post,
          safeContent: this.sanitizer.bypassSecurityTrustHtml(post.content),
        }));
        this.filterPosts(searchQuery);
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching posts by tag', error);
        this.isLoading = false;
        this.hasMorePosts = false;
      }
    );
  }

  navigateToPostDetail(postId: number) {
    this.router.navigate(['/post', postId]);
  }
}