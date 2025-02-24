import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SharedModule } from '../../shared.module';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
   SharedModule, 
   RouterModule,
  ],
    
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router){
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void{
    if(this.loginForm.valid){
      const { username, password}=this.loginForm.value;
      this.authService.login(username, password).subscribe({
        next: (res) => {
          console.log('Login Data:', this.loginForm.value);
          console.log('response',res.token)
          localStorage.setItem('authToken', res.token);
          this.router.navigate(['/fyp']);
        },
        error: (err) => {
          console.error('Login failed', err);
        }
      })
    
  }else{
    console.log('Form is invalid');
  }
}

logout(): void {
  localStorage.removeItem('authToken');
  this.router.navigate(['/login']); // Redirect to login page
}

}
