import { AfterViewInit, Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

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

  @ViewChild('summernote', { static: true }) summernote!: ElementRef;

  constructor(private fb: FormBuilder) {
    this.postForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      categories: ['', Validators.required],
      tags: ['', Validators.required]
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
  }

  onSubmit(): void {
    if (this.postForm.valid) {
      console.log(this.postForm.value);
    } else {
      console.log('Form is invalid');
    }
  }
}