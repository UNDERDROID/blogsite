import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../shared.module';
import { NavComponent } from '../nav/nav.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [
    SharedModule,
    NavComponent,
    MatCardModule
  ],
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.css']
})
export class PostDetailComponent implements OnInit{
  post: any = null;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private sanitizer: DomSanitizer,
    private router: Router
  ){}

  ngOnInit(): void {
    // Get the post ID from the route
    this.route.paramMap.subscribe(params => {
      const postId = Number(params.get('id'));
      if (postId) {
        this.fetchPostDetails(postId);
      }
    });
  }

  fetchPostDetails(postId: number): void {
    this.authService.getPostById(postId).subscribe(
      (data) => {
        // Sanitize post content
        this.post = {
          ...data,
          safeContent: this.sanitizer.bypassSecurityTrustHtml(data.content)
        };
      },
      (error) => {
        console.error('Error fetching post details', error);
      }
    );
  }

  navigateToHome(){
    this.router.navigate(['/fyp']);
  }
}

