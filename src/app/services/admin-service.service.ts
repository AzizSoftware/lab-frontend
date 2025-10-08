import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RoleEnum, User } from './models';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:8087/api/admin';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`, { headers: this.getAuthHeaders() });
  }

  approveUserByEmail(email: string, role: RoleEnum): Observable<User> {
    const params = new HttpParams().set('email', email).set('role', role);
    return this.http.put<User>(`${this.apiUrl}/users/approve`, null, { headers: this.getAuthHeaders(), params });
  }

  declineUserByEmail(email: string): Observable<User> {
    const params = new HttpParams().set('email', email);
    return this.http.put<User>(`${this.apiUrl}/users/decline`, null, { headers: this.getAuthHeaders(), params });
  }

  updateUserRole(userId: string, role: RoleEnum): Observable<User> {
    const params = new HttpParams().set('role', role);
    return this.http.put<User>(`${this.apiUrl}/users/${userId}/role`, null, { headers: this.getAuthHeaders(), params });
  }

  countUsersByRole(role: RoleEnum): Observable<number> {
    const params = new HttpParams().set('role', role);
    return this.http.get<number>(`${this.apiUrl}/users/count`, { headers: this.getAuthHeaders(), params });
  }

  countFiles(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/files/count`, { headers: this.getAuthHeaders() });
  }

  generateSummaryReport(): Observable<string> {
    return this.http.get(`${this.apiUrl}/report/summary`, { headers: this.getAuthHeaders(), responseType: 'text' });
  }
}