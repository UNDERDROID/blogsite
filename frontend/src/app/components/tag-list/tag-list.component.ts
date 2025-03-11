import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { SharedModule } from '../../shared.module';
import { CategoryService, tagData } from '../../services/category.service';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { NavComponent } from "../nav/nav.component";

@Component({
  selector: 'app-tag-list',
  standalone: true,
  imports: [SharedModule, NavComponent],
  templateUrl: './tag-list.component.html',
  styleUrl: './tag-list.component.css'
})
export class TagListComponent implements OnInit{
  tags: any[]=[]
  tagName: any = ""
  selectedTag: any = null
  selectedCategoryId: any =null
  dialogRef!: MatDialogRef<any>;
  categories: any[]=[]
  categoryMap: { [key: number]: string} = {};
  editMode: boolean =false;

constructor(
  private catService: CategoryService,
  private router: Router,
  private dialog: MatDialog,
){}
  @ViewChild('addTagDialog') addTagDialog!: TemplateRef<any>; // Reference to the dialog template


ngOnInit(): void {
  this.getCategories();
}
getCategories(): void {
  this.catService.getCategories().subscribe({
    next: (categories) => {
      console.log('Categories API Response:', categories); // Check the structure

      if (!Array.isArray(categories)) {
        console.error('Error: categories is not an array', categories);
        return;
      }

      this.categories = categories;

      // Ensure each category has an id and name
      this.categoryMap = categories.reduce((acc, category: any) => {
        if (typeof category === 'object' && 'id' in category && 'name' in category) {
          acc[category.id] = category.name;
        }
        return acc;
      }, {} as { [key: number]: string });

      this.getTags(); // Fetch tags after categories
    },
    error: (err) => {
      console.error('Error fetching categories', err);
    }
  });
}


getTags(): void {
  this.catService.getTags().subscribe({
    next: (response) => {
      console.log('Tags API Response:', response); // Check the structure

      if (!Array.isArray(response)) {
        console.error('Error: tags is not an array', response);
        return;
      }

      // Ensure each tag has an expected structure
      this.tags = response.map((tag: any) => {
        if (typeof tag !== 'object' || !('category_id' in tag)) {
          console.warn('Unexpected tag structure:', tag);
          return null; // Skip invalid entries
        }
        return {
          ...tag,
          category_name: this.categoryMap[tag.category_id] || 'Unknown'
        };
      }).filter(tag => tag !== null); // Remove null values

      console.log('Processed Tags:', this.tags);
    },
    error: (err) => {
      console.error('Error fetching tags', err);
    }
  });
}

openAddTagDialog(){
  this.editMode = false;
  this.tagName='';
  this.dialogRef = this.dialog.open(this.addTagDialog, {
    width: '400px'
  });
}

openEditTagDialog(tag: any){
  this.editMode = true;
  this.selectedTag = tag;
  this.tagName = tag.name;
  this.selectedCategoryId = tag.category_id;
  this.dialogRef = this.dialog.open(this.addTagDialog, {
    width: '400px'
  })
}

deleteTag(tagId: number): void{
  this.catService.deleteTags(tagId).subscribe({
    next:(response)=>{
      console.log('tag deleted');
      this.tags=this.tags.filter(tag=>tag.id!==tagId);
    },error:(err)=>{
      console.error('Error deleting tag',err);
    }
  })
}

closeDialog(){
  this.dialogRef.close();
}

 submitTag(){
    if(this.tagName.trim()){
      if(this.editMode && this.selectedTag && this.selectedCategoryId){
        const updatedTag: tagData = {name: this.tagName, category_id: this.selectedCategoryId};

        this.catService.updateTags(this.selectedTag.id, updatedTag).subscribe({
          next: (response)=>{
            console.log(`Tag ${updatedTag.name} updated`);

            this.tags = this.tags.map(tag =>
              tag.id === this.selectedTag.id 
                ? { ...response as tagData, category_name: this.categoryMap[(response as tagData).category_id] || 'Unknown' }
                : tag
            );
            
            this.closeDialog();
          },error: (err)=>{
            console.error('Error updating tags', err);
          }
        });
      }else{
      const tagData: tagData={
        name: this.tagName,
        category_id: this.selectedCategoryId
      }
      this.catService.createTag(tagData).subscribe({
        next: (response)=>{
          console.log(`category ${tagData.name} created`);
          this.tags=[
            ...this.tags,
            {
               response, 
               category_name: this.categoryMap[response.category_id]
              }
            ];
          this.closeDialog();
          this.tagName='';

        },error: (err)=>{
          console.error('Error creating tag',err);
        }
      })
    }
    }
  }


}
