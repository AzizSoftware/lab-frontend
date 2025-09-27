// src/app/services/project.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  // CRUD
  getAllProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.apiUrl);
  }

  getProjectById(id: string): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/${id}`);
  }

  createProject(project: Project): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, project);
  }

  updateProject(id: string, project: Project): Observable<Project> {
    return this.http.put<Project>(`${this.apiUrl}/${id}`, project);
  }

  deleteProject(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Team management
  addTeamMember(projectId: string, userId: string): Observable<Project> {
    return this.http.post<Project>(`${this.apiUrl}/${projectId}/addMember/${userId}`, {});
  }

  // Count
  countProjects(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count`);
  }

  // Search / Filter
  findByName(name: string): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiUrl}/search/name?name=${name}`);
  }

  findByStatus(status: string): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiUrl}/search/status?status=${status}`);
  }

  findByBudget(min: number, max: number): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiUrl}/search/budget?min=${min}&max=${max}`);
  }

  findByStartDateAfter(start: string): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiUrl}/search/startAfter?start=${start}`);
  }

  findByEndDateBefore(end: string): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiUrl}/search/endBefore?end=${end}`);
  }

  findByDateRange(start: string, end: string): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiUrl}/search/dateRange?start=${start}&end=${end}`);
  }
}
