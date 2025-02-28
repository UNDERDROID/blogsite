import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../shared.module';
import { CategoryService } from '../../services/category.service';
import { ActivatedRoute, Router } from '@angular/router';

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
  selectedCategories: number[]=[];
  selectedTags: number[]=[]
constructor(
  private categoryService: CategoryService, 
  private router: Router,
  private route: ActivatedRoute
){}

ngOnInit(): void {
  this.fetchCategories()
  this.fetchTags()

  //Get selected categories and tags from URL if any
  this.route.queryParams.subscribe(params=>{
      this.selectedCategories = params['categoryId']?params['categoryId'].split(',').map(Number): []
      this.selectedTags = params['tagId']?params['tagId'].split(',').map(Number): []
  })
}

fetchCategories(){
  this.categoryService.getCategories().subscribe(
    data=>{
    this.categories=data
    console.log('categories:',data);
  },
  error=>{
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

toggleCategory(categoryId: number) {
  const index = this.selectedCategories.indexOf(categoryId);

  if (index === -1) {
    // If not selected, add to the list
    this.selectedCategories.push(categoryId);
  } else {
    // If already selected, remove from the list
    this.selectedCategories.splice(index, 1);
  }

 this.updateQueryParams();
}

toggleTag(tagId: number) {
  const index = this.selectedTags.indexOf(tagId);

  if(index === -1){
    this.selectedTags.push(tagId);
  }else{
    this.selectedTags.splice(index, 1)
  }
this.updateQueryParams();
}

updateQueryParams() {
  this.router.navigate(['/fyp'], {
    queryParams: {
      categoryId: this.selectedCategories.length ? this.selectedCategories.join(',') : null,
      tagId: this.selectedTags.length ? this.selectedTags.join(',') : null
    },
    queryParamsHandling: 'merge' // Keeps existing query parameters
  });
}

getPostsByCategory(categoryId: number){
  this.router.navigate(['/fyp'],{queryParams: {categoryId}});
}

getPostsByTag(tagId: number){
  this.router.navigate(['fyp'], {queryParams: {tagId}});
}
}
