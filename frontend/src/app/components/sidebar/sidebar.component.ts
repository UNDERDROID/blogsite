import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { SharedModule } from '../../shared.module';
import { CategoryService } from '../../services/category.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatSidenav } from '@angular/material/sidenav';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit{
  @ViewChild('sidenav') sidenav!: MatSidenav;


  categories:any[]=[];
  tags:any[]=[];
  selectedCategories: number[]=[];
  selectedTags: number[]=[]
  isMobile = false;
  isExpanded = true;


constructor(
  private categoryService: CategoryService, 
  private router: Router,
  private route: ActivatedRoute,
  private breakpointObserver: BreakpointObserver,
){}



ngOnInit(): void {
  this.fetchCategories()
  this.fetchTags()

  //Get selected categories and tags from URL if any
  this.route.queryParams.subscribe(params=>{
      this.selectedCategories = params['categoryId']?params['categoryId'].split(',').map(Number): []
      this.selectedTags = params['tagId']?params['tagId'].split(',').map(Number): []
  })

   // Detect screen size changes
   this.breakpointObserver.observe([Breakpoints.Handset])
   .subscribe(result => {
     this.isMobile = result.matches;
     this.isExpanded = !this.isMobile; // Close sidebar on mobile
   });
}

fetchCategories(){
  this.categoryService.getCategories().subscribe(
    data=>{
    this.categories=data;
  },
  error=>{
    console.error('Error fetching categories', error);
  });
}

fetchTags(){
  this.categoryService.getTags().subscribe(data=>{
    this.tags=data;
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

toggleSideBar(){
  this.sidenav.toggle();
}

closeOnMobile(){
  if(this.isMobile){
    this.sidenav.close();
  }
}
getPostsByCategory(categoryId: number){
  this.router.navigate(['/fyp'],{queryParams: {categoryId}});
}

getPostsByTag(tagId: number){
  this.router.navigate(['fyp'], {queryParams: {tagId}});
}
}
