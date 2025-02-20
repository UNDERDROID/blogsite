
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { SharedModule } from '../../shared.module';
import { Router, RouterModule } from '@angular/router';
import { AuthService, RegisterData } from '../../services/auth.service';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
   SharedModule,
   RouterModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;

  // Pattern: at least one uppercase letter, one special character.
  private passwordPattern = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).+$/;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.registerForm = this.fb.group(
      {  
        username: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(this.passwordPattern)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordsMatchValidator }
    );
  }

  // Custom validator that sets an error on the confirmPassword control if the values don't match
  private passwordsMatchValidator(formGroup: AbstractControl): ValidationErrors | null {
    const passwordControl = formGroup.get('password');
    const confirmControl = formGroup.get('confirmPassword');
    if (!passwordControl || !confirmControl) {
      return null;
    }
    // Only compare if confirmPassword has been touched (or is non-empty)
    if (confirmControl.value && passwordControl.value !== confirmControl.value) {
      confirmControl.setErrors({ passwordsMismatch: true });
      return { passwordsMismatch: true };
    } else {
      // Remove the error if it exists and the values match
      if (confirmControl.errors && confirmControl.errors['passwordsMismatch']) {
        delete confirmControl.errors['passwordsMismatch'];
        if (!Object.keys(confirmControl.errors).length) {
          confirmControl.setErrors(null);
        }
      }
      return null;
    }
  }

  // Getter for the confirmPassword control to use in the template
  get confirmPasswordControl(): AbstractControl | null {
    return this.registerForm.get('confirmPassword');
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      const registerData: RegisterData = {
        username: this.registerForm.value.username,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password,
        role: 'user'
      };

      this.authService.register(registerData).subscribe({
        next: (res)=>{
          console.log("User registered", res);
          this.router.navigateByUrl('/login');
          
        },
        error: (err)=>{
          console.log("Registration error", err);
        }
      })
    } else {
      console.log('Form is invalid');
    }
  }
}