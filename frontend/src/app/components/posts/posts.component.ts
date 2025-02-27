import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../shared.module';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { NavComponent } from "../nav/nav.component";
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [
    SharedModule,
    NavComponent
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
  this.fetchPosts();

  this.route.queryParams.subscribe(params => {
    const searchQuery = params['search'] || '';
    this.filterPosts(searchQuery);
  })
}

fetchPosts(): void{
  this.authService.getPosts().subscribe(
    (data)=>{
      //Sanitize post content
      this.posts = data.map(post=> {
        return{
          ...post,
          content: this.sanitizer.bypassSecurityTrustHtml(post.content)
        }
      });
      this.filteredPosts = this.posts;
      console.log('fetched post:', data);
    },
  (error)=>{
    console.error('Error fetching posts', error);
  }
  )
  
}

filterPosts(query: string) {
  if(!query.trim()){
    this.filteredPosts=this.posts;
    return;
  }
  this.filteredPosts = this.posts.filter(post =>
    post.title.toLowerCase().includes(query.toLowerCase()) ||
    post.content.toLowerCase().includes(query.toLowerCase())
  );
}
}
