import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { JwtDecoderService } from './jwt-decoder-service.service';
import { FileDocument, User, Project, Event, LoginRequest, SignupRequest } from './models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = 'http://localhost:8087/api/users';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private jwtDecoderService: JwtDecoderService
  ) {
    if (this.isLoggedIn()) {
      this.loadCurrentUser();
    }
  }

  signup(userData: SignupRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/signup`, userData);
  }

  login(credentials: LoginRequest): Observable<string> {
    return this.http.post(`${this.baseUrl}/login`, credentials, { responseType: 'text' });
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    this.currentUserSubject.next(null);
  }

  saveToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  saveUserEmail(email: string): void {
    localStorage.setItem('userEmail', email);
  }

  getUserEmail(): string | null {
    return this.jwtDecoderService.getEmailFromToken() || localStorage.getItem('userEmail');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    return this.jwtDecoderService.getRoleFromToken() === 'ADMIN';
  }

  isPermanent(): boolean {
    return this.jwtDecoderService.getRoleFromToken() === 'PERMANENT';
  }

  isUser(): boolean {
    return this.jwtDecoderService.getRoleFromToken() === 'USER';
  }

  getCurrentUserId(): string | null {
    return this.jwtDecoderService.getUserIdFromToken();
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl, {
      headers: this.getAuthHeaders()
    });
  }

  getUserByEmail(email: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${email}`, {
      headers: this.getAuthHeaders()
    });
  }

  updateUser(email: string, userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/${email}`, userData, {
      headers: this.getAuthHeaders()
    });
  }

  updateUserRole(email: string, role: string): Observable<User> {
    const params = new HttpParams().set('role', role);
    return this.http.put<User>(`${this.baseUrl}/${email}/role`, null, {
      headers: this.getAuthHeaders(),
      params: params
    });
  }

  uploadFile(
    email: string,
    file: File,
    fileMetadata: {
      title: string;
      authors: string[];
      affiliations: string[];
      publicationDate: string;
      abstractText: string;
      keywords: string[];
      doi?: string;
      fileType: string;
    }
  ): Observable<User> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', fileMetadata.title);
    fileMetadata.authors.forEach(author => formData.append('authors', author));
    fileMetadata.affiliations.forEach(affiliation => formData.append('affiliations', affiliation));
    fileMetadata.keywords.forEach(keyword => formData.append('keywords', keyword));
    formData.append('publicationDate', fileMetadata.publicationDate);
    formData.append('abstractText', fileMetadata.abstractText);
    if (fileMetadata.doi) {
      formData.append('doi', fileMetadata.doi);
    }
    formData.append('fileType', fileMetadata.fileType);

    return this.http.post<User>(`${this.baseUrl}/${email}/uploads`, formData, {
      headers: this.getAuthHeadersForFormData()
    });
  }

  uploadProfilePhoto(email: string, file: File): Observable<User> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<User>(`${this.baseUrl}/${email}/photo`, formData, {
      headers: this.getAuthHeadersForFormData()
    });
  }

  downloadFile(url: string): Observable<Blob> {
    return this.http.get(url, {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    });
  }

  getRecentUploads(days: number = 7): Observable<FileDocument[]> {
    const params = new HttpParams().set('days', days.toString());
    return this.http.get<FileDocument[]>(`${this.baseUrl}/uploads/recent`, {
      headers: this.getAuthHeaders(),
      params: params
    });
  }

  getEnrolledProjects(email: string): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.baseUrl}/${email}/enrolled-projects`, {
      headers: this.getAuthHeaders()
    });
  }

  getEnrolledEvents(email: string): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.baseUrl}/${email}/enrolled-events`, {
      headers: this.getAuthHeaders()
    });
  }

  loadCurrentUser(): void {
    const email = this.getUserEmail();
    if (email) {
      this.getUserByEmail(email).subscribe({
        next: (user) => this.currentUserSubject.next(user),
        error: (error) => {
          console.error('Failed to load current user:', error);
          this.logout();
        }
      });
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  updateCurrentUser(userData: Partial<User>): Observable<User> {
    const email = this.getUserEmail();
    if (!email) {
      throw new Error('No user logged in');
    }
    return this.updateUser(email, userData);
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private getAuthHeadersForFormData(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  getFileUrl(filename: string): string {
    return `${this.baseUrl}/uploads/${filename}`;
  }

  formatUserName(user: User): string {
    return `${user.firstName} ${user.lastName}`.trim();
  }

  getUserStatusColor(status: string): string {
    switch (status.toUpperCase()) {
      case 'APPROVED': return '#27ae60';
      case 'PENDING': return '#f39c12';
      case 'DECLINED': return '#e74c3c';
      default: return '#95a5a6';
    }
  }

  getUserRoleDisplay(role: string): string {
    switch (role.toUpperCase()) {
      case 'SUPER_ADMIN': return 'Super Admin';
      case 'ADMIN': return 'Administrator';
      case 'PERMANENT': return 'Researcher';
      case 'USER': return 'Visitor';
      default: return role;
    }
  }
}