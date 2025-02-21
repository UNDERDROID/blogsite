import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../shared.module';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [
    SharedModule,
  ],
  templateUrl: './posts.component.html',
  styleUrl: './posts.component.css'
})
export class PostsComponent implements OnInit {
posts: any[] = [];

constructor(private authService: AuthService, private http: HttpClient){}

ngOnInit(): void {
  this.fetchPosts();
}

fetchPosts(): void{
  this.authService.getPosts().subscribe(
    (data)=>{
      this.posts = data;
      console.log('fetched post:', data);
    },
  (error)=>{
    console.error('Error fetching posts', error);
  }
  )
}
}
