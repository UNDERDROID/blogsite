import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { SharedModule } from '../../shared.module';
import { CategoryService, categoryData } from '../../services/category.service';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';


@Component({
  selector: 'app-cat-list',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './cat-list.component.html',
  styleUrl: './cat-list.component.css'
})
export class CatListComponent implements OnInit{
  categories: any[]=[];
  categoryName: any="";
  dialogRef!: MatDialogRef<any>;
  editMode: boolean= false;
  selectedCategory: any = null;

  constructor(
    private catService: CategoryService, 
    private router: Router,
    private dialog: MatDialog

  ){}
  @ViewChild('addCategoryDialog') addCategoryDialog!: TemplateRef<any>; // Reference to the dialog template


  ngOnInit(): void {
  this.getCategories();
  }

   getCategories(): void{
    this.catService.getCategories().subscribe({
      next: (data)=>{
        this.categories=data;
        console.log(this.categories);
      },error: (err)=>{
        console.error('Error fetching categories',err);
      }
    })
  }

  openAddCategoryDialog(){
    this.editMode = false;
    this.categoryName='';
    this.dialogRef = this.dialog.open(this.addCategoryDialog, {
      width: '400px'
    });
  }

  openEditCategoryDialog(category: any){
    this.editMode=true;
    this.selectedCategory= category;
    this.categoryName= category.name;
    this.dialogRef = this.dialog.open(this.addCategoryDialog, {
      width: '400px'
    })
  }

  closeDialog(){
    this.dialogRef.close();
  }

  submitCategory(){
    if(this.categoryName.trim()){
      if(this.editMode && this.selectedCategory){
        const updatedCategory: categoryData = {name: this.categoryName};

        this.catService.updateCategory(this.selectedCategory.id, updatedCategory).subscribe({
          next: (response)=>{
            console.log(`Category ${updatedCategory.name} updated`);

            this.categories = this.categories.map(category=>
              category.id === this.selectedCategory.id? response: category
            );
            this.closeDialog();
          },error: (err)=>{
            console.error('Error updating category', err);
          }
        });
      }else{
      const catData: categoryData={
        name: this.categoryName
      }
      this.catService.createCategory(catData).subscribe({
        next: (response)=>{
          console.log(`category ${catData.name} created`);
          this.categories=[...this.categories, response];
          this.closeDialog();
          this.categoryName='';

        },error: (err)=>{
          console.error('Error creating category',err);
        }
      })
    }
    }
  }

  deleteCategory(catId: number){
    this.catService.deleteCategory(catId).subscribe({
      next:()=>{
        console.log('User deleted');
        this.categories=this.categories.filter(category=>category.id!==catId);
      },
      error: (err)=>{
        console.error('Error deleting category',err);
      }
    })
  }
}
