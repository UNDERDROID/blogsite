import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../shared.module';
import { AuthService } from '../../services/auth.service';
import { IonicModule } from '@ionic/angular';
import { NavComponent } from '../nav/nav.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { Router } from '@angular/router';
import { PostService } from '../../services/post.service';

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [
    SharedModule, IonicModule, NavComponent, NgxDatatableModule
    
  ],
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit{
  posts: any[]=[];
  totalElements: number = 0;
  loading = false;
  page=0;
  limit=10;
  pageSizes=[5, 10, 15];

constructor(private authService: AuthService, private postService: PostService, private router: Router){}

ngOnInit(): void {
  this.getPosts();
}

getPosts(): void{
  this.loading=true;
this.authService.getPosts().subscribe ({
next: (data: any)=>{
  this.posts=data;
  this.totalElements=data.length
  this.loading=false
},
error: (err)=>{
  console.error('error fetching posts',err);
  this.loading=false;
}
})
}

onLimitChange(): void{
  this.page=0;
}

setPage(pageInfo: any) {
  this.page = pageInfo.offset;
  this.getPosts();
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
