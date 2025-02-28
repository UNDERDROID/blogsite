import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../shared.module';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { IonicModule } from '@ionic/angular';
import { IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/angular/standalone';
import { NavComponent } from '../nav/nav.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [SharedModule, NgxDatatableModule, IonicModule,  NavComponent],
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
    { prop: 'role', name: 'Role' }
]

constructor(
  private http: HttpClient,
  private authService: AuthService 
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

setPage(pageInfo: any) {
  this.page = pageInfo.offset;
  this.loadUsers();
}
}
