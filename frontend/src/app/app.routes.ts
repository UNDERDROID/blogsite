import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { PostsComponent } from './components/posts/posts.component';
import { CreatePostComponent } from './components/create-post/create-post.component';
import { adminGuard } from './guards/admin.guard';
import { SidebarComponent } from './components/sidebar/sidebar.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    {path: 'register', component: RegisterComponent },
    {path: 'fyp', component: PostsComponent},
    {path: 'sidebar', component: SidebarComponent},
    {path: 'create-post', component: CreatePostComponent, canActivate: [adminGuard]},
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
