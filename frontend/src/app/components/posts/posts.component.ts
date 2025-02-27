import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../shared.module';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { NavComponent } from "../nav/nav.component";
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { param } from 'jquery';
import { SidebarComponent } from "../sidebar/sidebar.component";

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [
    SharedModule,
    NavComponent,
    SidebarComponent
  ],
  templateUrl: './posts.component.html',
  styleUrl: './posts.component.css'
})
export class PostsComponent implements OnInit {
  posts: any[] = [];
  filteredPosts: any[] = [];

  constructor(
    private authService: AuthService, 
    private http: HttpClient, 
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer
  ){}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const categoryId = params['categoryId'];
      const tagId = params['tagId'];
      const searchQuery = params['search'] || '';

      if (categoryId) {
        this.fetchPostsByCategory(categoryId, searchQuery);
      } else if (tagId) {
        this.fetchPostsByTag(tagId, searchQuery);
      } else {
        this.fetchPosts(searchQuery);
      }
    });
  }

  fetchPosts(searchQuery: string): void {
    this.authService.getPosts().subscribe(
      (data) => {
        //Sanitize post content
        this.posts = data.map(post => ({
          ...post,
          safeContent: this.sanitizer.bypassSecurityTrustHtml(post.content)
        }));
        this.filterPosts(searchQuery);
        console.log('fetched post:', data);
      },
      (error) => {
        console.error('Error fetching posts', error);
      }
    );
  }

  filterPosts(query: string) {
    if (!query.trim()) {
      this.filteredPosts = this.posts;
      return;
    }

    this.filteredPosts = this.posts.filter(post =>
      post.title.toLowerCase().includes(query.toLowerCase()) ||
      post.content.toLowerCase().includes(query.toLowerCase())
    );
    console.log('Filtered posts:', this.filteredPosts.length);
  }

  fetchPostsByCategory(categoryId: number, searchQuery: string) {
    this.http.get<any[]>(`http://localhost:5000/api/posts/by-categories?categories=${categoryId}`).subscribe(
      (data) => {
        this.posts = data.map(post => ({
          
            ...post,
            safeContent: this.sanitizer.bypassSecurityTrustHtml(post.content)
        }));
        this.filterPosts(searchQuery);
      },
      (error) => {
        console.error('Error fetching posts by category', error);
      }
    );
  }

  fetchPostsByTag(tagId: number, searchQuery: string) {
    this.http.get<any[]>(`http://localhost:5000/api/posts/by-tags?tags=${tagId}`).subscribe(
      (data) => {
        this.posts = data.map(post => ({
          ...post,
          safeContent: this.sanitizer.bypassSecurityTrustHtml(post.content)
        }));
        this.filterPosts(searchQuery);
      },
      (error) => {
        console.error('Error fetching posts by tag', error);
      }
    );
  }
}