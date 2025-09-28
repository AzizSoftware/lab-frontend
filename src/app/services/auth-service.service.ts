import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  grade: string;
  institute: string;
  lastDiploma: string;
  researchArea: string;
  linkedInUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8087/api/users';

  constructor(private http: HttpClient, private router: Router) {}

  // ----------------- LOGIN -----------------
  login(data: LoginRequest): Observable<string> {
    return this.http.post(this.baseUrl + '/login', data, { responseType: 'text' }).pipe(
      tap(token => {
        localStorage.setItem('authToken', token); // Save JWT token
        localStorage.setItem('userEmail', data.email); // Save user email
        this.router.navigate(['/home']); // Redirect to home
      })
    );
  }

  // ----------------- SIGNUP -----------------
  signup(data: SignupRequest): Observable<string> {
    return this.http.post(this.baseUrl + '/signup', data, { responseType: 'text' }).pipe(
      tap(res => {
        console.log(res); // Log backend message
        this.router.navigate(['/login']); // Redirect to login page
      })
    );
  }

  // ----------------- LOGOUT -----------------
  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    this.router.navigate(['/login']);
  }

  // ----------------- TOKEN -----------------
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }
}