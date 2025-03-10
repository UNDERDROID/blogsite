import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../shared.module';
import { AuthService } from '../../services/auth.service';
import { IonicModule } from '@ionic/angular';
import { NavComponent } from '../nav/nav.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { Router } from '@angular/router';
import { PostService } from '../../services/post.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [
    SharedModule, MatButtonModule, NavComponent, NgxDatatableModule
    
  ],
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit{
  posts: any[]=[];
  totalElements: number = 0;
  loading = false;
  page=1;
  limit=10;
  pageSizes=[5, 10, 15];

constructor(private authService: AuthService, private postService: PostService, private router: Router){}

ngOnInit(): void {
  this.getPosts();
}

getPosts(): void{
  this.loading=true;
this.postService.getPostsForList(this.page, this.limit).subscribe ({
next: (data: any)=>{
  this.posts=data.rows;
  this.totalElements=data.count;
  this.loading=false;
},
error: (err)=>{
  console.error('error fetching posts',err);
  this.loading=false;
}
})
}

onLimitChange(): void{
  this.page=1;
  this.getPosts();
}

setPage(pageInfo: any) {
  if (pageInfo.offset + 1 !== this.page) {
    this.page = pageInfo.offset + 1; // Increment or decrement page based on ngx-datatable offset
    this.getPosts(); // Fetch new posts
  }
}

prevPage() {
  if (this.page > 1) {
    this.page--;
    this.getPosts();
  }
}

nextPage() {
  if (this.page < this.totalPages()) {
    this.page++;
    this.getPosts();
  }
}

totalPages(): number {
  return Math.ceil(this.totalElements / this.limit); // Calculate total pages
}


navigateToEditPost(postId: number){
  this.router.navigate([`/edit-post/${postId}`])
}

deletePost(postId: number){
  this.postService.deletePost(postId).subscribe({
    next: ()=>{
      console.log('Post deleted successfully');
      this.getPosts();
    },
    error: (err)=>{
      console.error('Failed to delete post',err);
    }
  });
}
}
