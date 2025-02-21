import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { PostsComponent } from './components/posts/posts.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    {path: 'register', component: RegisterComponent },
    {path: 'fyp', component: PostsComponent},
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
