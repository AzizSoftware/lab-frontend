import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth-service.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  signupForm: FormGroup;
  message = '';

  constructor(private fb: FormBuilder, private auth: AuthService) {
    this.signupForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.signupForm.invalid) return;

    this.auth.signup(this.signupForm.value).subscribe({
      next: (res: string) => {
        this.message = res;
        // Navigation to /login handled by AuthService
      },
      error: (err) => {
        this.message = err.error || 'Signup failed';
      }
    });
  }
}