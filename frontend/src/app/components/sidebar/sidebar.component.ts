import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../shared.module';
import { CategoryService } from '../../services/category.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit{
  categories:any[]=[];
  tags:any[]=[];
constructor(private categoryService: CategoryService, private router: Router){}

ngOnInit(): void {
  this.fetchCategories()
  this.fetchTags()
}

fetchCategories(){
  this.categoryService.getCategories().subscribe(data=>{
    this.categories=data
    console.log('categories:',data);
  },error=>{
    console.error('Error fetching categories', error);
  });
}

fetchTags(){
  this.categoryService.getTags().subscribe(data=>{
    this.tags=data
    console.log('tags:',data);
  },error=>{
    console.error('Error fetching tags', error);
  });
}

getPostsByCategory(categoryId: number){
  this.router.navigate(['/fyp'],{queryParams: {categoryId}});
}

getPostsByTag(tagId: number){
  this.router.navigate(['fyp'], {queryParams: {tagId}});
}
}
