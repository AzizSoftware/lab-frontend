import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Project {
  id?: string;
  projectName: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
  budget: number;
  maxTeamMembers: number;
  availableSpots?: number;
  image?: string;
  imagePath?: string;
  teamMembers?: string[];
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private apiUrl = 'http://localhost:8087/api/projects';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken'); // Changed from 'token'
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  getAllProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getProjectById(id: string): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  createProject(project: Project): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, project, { headers: this.getHeaders() });
  }

  updateProject(id: string, project: Project): Observable<Project> {
    return this.http.put<Project>(`${this.apiUrl}/${id}`, project, { headers: this.getHeaders() });
  }

  deleteProject(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  addTeamMember(projectId: string, userId: string): Observable<Project> {
    return this.http.post<Project>(`${this.apiUrl}/${projectId}/addMember/${userId}`, {}, { headers: this.getHeaders() });
  }

  countProjects(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count`, { headers: this.getHeaders() });
  }

  findByName(name: string): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiUrl}/search/name?name=${name}`, { headers: this.getHeaders() });
  }

  findByStatus(status: string): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiUrl}/search/status?status=${status}`, { headers: this.getHeaders() });
  }

  findByBudget(min: number, max: number): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiUrl}/search/budget?min=${min}&max=${max}`, { headers: this.getHeaders() });
  }

  findByStartDateAfter(start: string): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiUrl}/search/startAfter?start=${start}`, { headers: this.getHeaders() });
  }

  findByEndDateBefore(end: string): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiUrl}/search/endBefore?end=${end}`, { headers: this.getHeaders() });
  }

  findByDateRange(start: string, end: string): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiUrl}/search/dateRange?start=${start}&end=${end}`, { headers: this.getHeaders() });
  }
}