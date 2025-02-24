import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { PostsComponent } from './components/posts/posts.component';
import { CreatePostComponent } from './components/create-post/create-post.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    {path: 'register', component: RegisterComponent },
    {path: 'fyp', component: PostsComponent},
    {path: 'create-post', component: CreatePostComponent},
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
