import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../shared.module';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { NavComponent } from "../nav/nav.component";
import { ActivatedRoute } from '@angular/router';

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

constructor(private authService: AuthService, private http: HttpClient, private route: ActivatedRoute){}

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
      this.posts = data;
      this.filteredPosts = data;
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
