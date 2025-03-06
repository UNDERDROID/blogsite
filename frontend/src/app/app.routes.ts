import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { PostsComponent } from './components/posts/posts.component';
import { CreatePostComponent } from './components/create-post/create-post.component';
import { adminGuard } from './guards/admin.guard';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { UserListComponent } from './components/user-list/user-list.component';
import { PostListComponent } from './components/post-list/post-list.component';
import { PostDetailComponent } from './components/post-detail/post-detail.component';
import { EditPostComponent } from './components/edit-post/edit-post.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    {path: 'register', component: RegisterComponent },
    {path: 'fyp', component: PostsComponent},
    {path: 'sidebar', component: SidebarComponent},
    {path: 'create-post', component: CreatePostComponent, canActivate: [adminGuard]},
    {path: 'user-list', component: UserListComponent, canActivate: [adminGuard]},
    {path: 'post-list', component: PostListComponent, canActivate: [adminGuard]},
    {path: 'post/:id', component: PostDetailComponent},
    {path: 'edit-post/:id', component: EditPostComponent},
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
