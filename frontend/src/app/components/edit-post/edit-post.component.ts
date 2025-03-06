import { Component, ElementRef, OnInit, ViewChild,  } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SharedModule } from '../../shared.module';
import { CategoryService } from '../../services/category.service';
import { NavComponent } from "../nav/nav.component";
import { TextFieldModule } from '@angular/cdk/text-field';
declare var $: any;


@Component({
  selector: 'app-edit-post',
  standalone: true,
  imports: [SharedModule, NavComponent, TextFieldModule],
  templateUrl: './edit-post.component.html',
  styleUrl: './edit-post.component.css'
})
export class EditPostComponent implements OnInit{
editForm: FormGroup;
postId: number | null=null;
categories: any[] = [];
tags: any[]=[];
selectedCategories: string[]=[];
selectedTags: string[]=[];
  @ViewChild('summernote', { static: true }) summernote!: ElementRef;


  constructor(
  private route: ActivatedRoute,
  private router: Router,
  private fb: FormBuilder,
  private authService: AuthService,
  private categoryService: CategoryService
){
  this.editForm = this.fb.group({
    title: [''],
    content: [''],
    categories: [[]],
    tags: [[]]
  })
}

ngOnInit(): void {
  $(document).ready(() => {
    // Ensure tooltips & popovers are initialized before Summernote
    $('[data-toggle="popover"]').popover();
    $('[data-toggle="tooltip"]').tooltip();

    $(this.summernote.nativeElement).summernote({
      height: 300,
      placeholder: 'Write post here...',
      popover: {
        image: [],
        link: [],
        air: []
      }, // Disable popovers to avoid errors
      callbacks: {
        onChange: (content: string) => {
          this.editForm.controls['content'].setValue(content);
        }
      }
    });
  });

  this.categoryService.getCategories().subscribe({
    next:(data)=>{
      this.categories=data;
    },
    error: (err)=>{
      console.error('Error fetching categories', err);
    }
  })

  this.categoryService.getTags().subscribe({
    next:(data)=>{
      this.tags=data;
    },
    error:(err)=>{
      console.error('Error fetching tags',err);
    }
  })

  this.postId=Number(this.route.snapshot.paramMap.get('id'));
  if(this.postId){
    this.authService.getPostById(this.postId).subscribe({
      next: (post)=>{
        this.editForm.patchValue({
          title: post.title,
        })

        //Add content of the post in summernote
        $(this.summernote.nativeElement).summernote('code', post.content);

        //Add existing categories of the post to selected categories
        if(post.categories && post.categories.length>0){
          this.selectedCategories=[...post.categories];
          this.editForm.controls['categories'].setValue(this.selectedCategories);
        }

        //Add existing tags of the post to selected tags
        if(post.tags && post.tags.length>0){
          this.selectedTags=[...post.tags];
          this.editForm.controls['tags'].setValue(this.selectedTags);
        }
      },
      error: (err)=> console.error('Error fetching posts',err)
    })
  }else{
    console.error('Invalid post id');
  }


}


onCategoryChange(category: any, event: any): void {
  if (event.checked) {
    this.selectedCategories.push(category.name);
  } else {
    this.selectedCategories = this.selectedCategories.filter(name => name !== category.name);
  }
  this.editForm.controls['categories'].setValue(this.selectedCategories);
}

onTagChange(tag: any, event: any):void{
  if(event.checked){
    this.selectedTags.push(tag.name);
  }else{
    this.selectedTags = this.selectedTags.filter(name => name !== tag.name);
  }
  this.editForm.controls['tags'].setValue(this.selectedTags);
}

savePost(): void {
  if (this.editForm.valid && this.postId) {
    console.log('Selected tags:', this.editForm.value.tags);
    console.log('Selected categories:', this.editForm.value.categories)
    this.authService.updatePost(
      this.postId,
      this.editForm.value.title,
      this.editForm.value.content,
      this.editForm.value.categories,
      this.editForm.value.tags
    ).subscribe({
      next: () => this.router.navigate(['/fyp']), // Navigate back after update
      error: (err) => console.error('Error updating post', err),
    });
  }
}

}
