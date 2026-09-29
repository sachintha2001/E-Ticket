import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  isLoginMode = true; // Toggle between Login and Register
  isLoading = false;
  errorMessage = '';

  authForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.errorMessage = '';
  }

  async onSubmit() {
    if (this.authForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      const { email, password } = this.authForm.value;

      try {
        if (this.isLoginMode) {
          await this.authService.login(email!, password!);
        } else {
          await this.authService.register(email!, password!);
        }
      } catch (error: any) {
        // Firebase error mapping
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
           this.errorMessage = 'Invalid email or password.';
        } else if (error.code === 'auth/email-already-in-use') {
           this.errorMessage = 'This email is already registered. Please login.';
        } else {
           this.errorMessage = 'An error occurred. Please try again.';
        }
      } finally {
        this.isLoading = false;
      }
    }
  }
}
