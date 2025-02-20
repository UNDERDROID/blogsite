import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SharedModule } from '../../shared.module';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
   SharedModule
  ],
    
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder){
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }
  


  onSubmit(): void{
    if(this.loginForm.valid){
    console.log('Login Data:', this.loginForm.value);
  }else{
    console.log('Form is invalid');
  }
}
}
