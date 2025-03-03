import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../shared.module';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { IonicModule } from '@ionic/angular';
import { IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/angular/standalone';
import { NavComponent } from '../nav/nav.component';
import { MatDialog } from '@angular/material/dialog';
import { UpdateUserDialogComponent } from '../update-user-dialog/update-user-dialog.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [SharedModule, NgxDatatableModule, IonicModule,  NavComponent,],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit{
users: any[] = [];
loading: boolean = true;
page = 0;
totalElements: number = 0;
columns = [
  { prop: 'id', name: 'ID' },
    { prop: 'username', name: 'Username' },
    { prop: 'email', name: 'Email' },
    // { prop: 'role', name: 'Role' }
]

constructor(
  private http: HttpClient,
  private authService: AuthService,
  private dialog: MatDialog
){}

ngOnInit(): void {
 this.loadUsers();
}

loadUsers(): void{
  this.loading=true;
  this.authService.getUsers().subscribe({
    next: (data: any) => {
      this.users=data;
      this.totalElements=data.length
      this.loading=false;
    },
    error: (err)=>{
      console.error('Error fetching users:', err);
      this.loading=false;
    }
  })
}

deleteUser(userId: number){
  console.log(userId);
  this.authService.deleteUser(userId).subscribe({
    next:()=>{
      this.users = this.users.filter(user => user.id !==userId);
      console.log('User deleted');
    },
    error: (err)=>{
      console.error('Failed to delete user',err);
    }
  })
}

  // Open a dialog to update a user
  openUpdateUserDialog(user: any) {
    const dialogRef = this.dialog.open(UpdateUserDialogComponent, {
      width: '400px',
      data: { user } // Pass the user data to the dialog
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.updateUser(user.id, result);
      }
    });
  }

updateUser(userId: number, updateData: {username?: string, email?: string, role?: string}){
  this.authService.updateUser(userId, updateData).subscribe({
    next: (updatedUser) => {
      console.log('User updated');

      //Update the local index array
      const index = this.users.findIndex(user => user.id === userId);
      if(index!==-1){
        this.users[index] = {...this.users[index], ...updateData};
        this.users=[...this.users];
      }
  
    },
    error:(err) => {
      console.error('Failed to update user', err);
    }
  })
}

setPage(pageInfo: any) {
  this.page = pageInfo.offset;
  this.loadUsers();
}
}
