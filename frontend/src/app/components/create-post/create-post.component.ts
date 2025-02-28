import { AfterViewInit, Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CategoryService } from '../../services/category.service';
import { PostService, PostData } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
import 'summernote/dist/summernote-bs4';
import { SharedModule } from '../../shared.module';
import { NavComponent } from "../nav/nav.component";
declare var $: any;

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, SharedModule, NavComponent],
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.css']
})
export class CreatePostComponent implements OnInit {
  postForm: FormGroup;
  categories: any[]=[];
  tags: any[]=[];
  selectedCategories: string[]=[];
  selectedTags: string[]=[];
  @ViewChild('summernote', { static: true }) summernote!: ElementRef;

  constructor(
    private fb: FormBuilder, 
    private categoryService: CategoryService, 
    private postService: PostService,
    private router: Router
  ){
    this.postForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      categories: [[]],
      tags: [[]]
    });
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
            this.postForm.controls['content'].setValue(content);
          }
        }
      });
    });

    this.categoryService.getCategories().subscribe({
      next: (data)=>{
      this.categories=data;
    },
  error: (error)=>{
    console.error('Error loading categories');
  }
  });

    this.categoryService.getTags().subscribe(data=>{
      this.tags=data;
    })

  }

  onCategoryChange(category: any, event: any): void {
    if (event.checked) {
      this.selectedCategories.push(category.name);
    } else {
      this.selectedCategories = this.selectedCategories.filter(name => name !== category.name);
    }
    this.postForm.controls['categories'].setValue(this.selectedCategories);
  }

  onTagChange(tag: any, event: any): void {
    if (event.checked) {
      this.selectedTags.push(tag.name);
    } else {
      this.selectedTags = this.selectedTags.filter(name => name !== tag.name);
    }
    this.postForm.controls['tags'].setValue(this.selectedTags);
  }


  onSubmit(): void {
    if (this.postForm.valid) {
      const postData: PostData = {
        title: this.postForm.value.title,
        content: this.postForm.value.content,
        categories: this.postForm.value.categories,
        tags: this.postForm.value.tags
      }

        // const authToken = localStorage.getItem('authToken') || '';
        // console.log(authToken);

        this.postService.createPost(postData).subscribe({
          next: (response) => {
            console.log('Post created successfully', response);

            //Reset the form
            this.postForm.reset();

            //Clear selected categories and tags
            this.selectedCategories = [];
            this.selectedTags = [];

            //Reset the form control values for categories and tags
            this.postForm.controls['categories'].setValue([]);
            this.postForm.controls['tags'].setValue([]);

            //Clear Summernote content
            $(this.summernote.nativeElement).summernote('code', '');

            // Force Angular to detect changes and update the view
            this.categories = [...this.categories];
            this.tags = [...this.tags];

            this.router.navigate(['/fyp']);
          },
          error: (error) => {
            console.error('Error creating post', error);
          }
        });
    } else {
      Object.keys(this.postForm.controls).forEach(key => {
        this.postForm.get(key)?.markAsTouched();
      });
      console.log('Form is invalid');
    }
  }
}