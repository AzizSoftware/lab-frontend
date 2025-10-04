import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { JwtDecoderService } from './jwt-decoder-service.service';
import { LoginRequest, SignupRequest } from './models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8087/api/users';

  constructor(
    private http: HttpClient,
    private router: Router,
    private jwtDecoder: JwtDecoderService
  ) {}

  login(data: LoginRequest): Observable<string> {
    return this.http.post(this.baseUrl + '/login', data, { responseType: 'text' }).pipe(
      tap({
        next: (token) => {
          console.log('Login successful, token:', token);
          localStorage.setItem('authToken', token);
          localStorage.setItem('userEmail', data.email);
          this.router.navigate(['/home']);
        },
        error: (err) => {
          console.error('Login failed:', err);
        }
      })
    );
  }

  signup(data: SignupRequest): Observable<string> {
    return this.http.post(this.baseUrl + '/signup', data, { responseType: 'text' }).pipe(
      tap({
        next: () => {
          console.log('Signup successful');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error('Signup failed:', err);
        }
      })
    );
  }

  logout(): void {
    console.log('Logging out, removing authToken and userEmail');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    const token = localStorage.getItem('authToken');
    console.log('getToken:', token);
    return token;
  }

  isLoggedIn(): boolean {
    const isLoggedIn = !!this.getToken();
    console.log('isLoggedIn:', isLoggedIn);
    return isLoggedIn;
  }
}