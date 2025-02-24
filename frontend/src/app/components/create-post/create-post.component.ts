import { AfterViewInit, Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CategoryService } from '../../services/category.service';
import 'summernote/dist/summernote-bs4';
import { style } from '@angular/animations';

declare var $: any;

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.css']
})
export class CreatePostComponent implements OnInit {
  postForm: FormGroup;
  categories: any[]=[];
  tags: any[]=[];
  selectedCategories: any[]=[];
  selectedTags: any[]=[];
  @ViewChild('summernote', { static: true }) summernote!: ElementRef;

  constructor(private fb: FormBuilder, private categoryService: CategoryService) {
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

    this.categoryService.getCategories().subscribe(data=>{
      this.categories=data;
    });

    this.categoryService.getTags().subscribe(data=>{
      this.tags=data;
    })

  }

  onCategoryChange(category: any, event: any) {
    if (event.target.checked) {
      this.selectedCategories.push(category.id);
    } else {
      this.selectedCategories = this.selectedCategories.filter(cat => cat !== category);
    }
    this.postForm.controls['categories'].setValue(this.selectedCategories);
  }

  onTagChange(tag: any, event: any) {
    if (event.target.checked) {
      this.selectedTags.push(tag);
    } else {
      this.selectedTags = this.selectedTags.filter(t => t !== tag);
    }
    this.postForm.controls['tags'].setValue(this.selectedTags);
  }


  onSubmit(): void {
    if (this.postForm.valid) {
      console.log(this.postForm.value);
    } else {
      console.log('Form is invalid');
    }
  }
}