import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth-service.service';
import { Router } from '@angular/router';   // 👈 import Router

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  signupForm: FormGroup;
  message = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router   // 👈 inject router
  ) {
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
        // 👇 redirect to login page after successful signup
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.message = err.error || 'Signup failed';
      }
    });
  }
}
