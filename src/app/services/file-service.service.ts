import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { FileDocument, User } from './models';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private apiUrl = 'http://localhost:8087/api/files';
  private userApiUrl = 'http://localhost:8087/api/users';
  private fileTypesUrl = 'http://localhost:8087/api/file-types';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : ''
    });
  }

  getAllFiles(): Observable<FileDocument[]> {
    return this.http.get<FileDocument[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  getFileById(id: string): Observable<FileDocument> {
    return this.http.get<FileDocument>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() }).pipe(
      catchError(() => {
        const email = localStorage.getItem('userEmail');
        if (!email) {
          throw new Error('User email not found. Please log in.');
        }
        return this.http.get<User>(`${this.userApiUrl}/${email}`, { headers: this.getAuthHeaders() }).pipe(
          map(user => {
            const file = user.uploads.find(f => f.id === id);
            if (!file) {
              throw new Error(`File with ID ${id} not found`);
            }
            return file;
          })
        );
      })
    );
  }

  getFileTypes(): Observable<string[]> {
    return this.http.get<string[]>(this.fileTypesUrl, { headers: this.getAuthHeaders() });
  }

  findByTitle(title: string): Observable<FileDocument[]> {
    const params = new HttpParams().set('title', title);
    return this.http.get<FileDocument[]>(`${this.apiUrl}/search/title`, { headers: this.getAuthHeaders(), params });
  }

  findByKeyword(keyword: string): Observable<FileDocument[]> {
    const params = new HttpParams().set('keyword', keyword);
    return this.http.get<FileDocument[]>(`${this.apiUrl}/search/keyword`, { headers: this.getAuthHeaders(), params });
  }

  findByAuthor(author: string): Observable<FileDocument[]> {
    const params = new HttpParams().set('author', author);
    return this.http.get<FileDocument[]>(`${this.apiUrl}/search/author`, { headers: this.getAuthHeaders(), params });
  }

  findByType(type: string): Observable<FileDocument[]> {
    const params = new HttpParams().set('type', type);
    return this.http.get<FileDocument[]>(`${this.apiUrl}/search/type`, { headers: this.getAuthHeaders(), params });
  }

  findByRank(rank: string): Observable<FileDocument[]> {
    const params = new HttpParams().set('rank', rank);
    return this.http.get<FileDocument[]>(`${this.apiUrl}/search/ranking`, { headers: this.getAuthHeaders(), params });
  }

  findByDateAfter(date: string): Observable<FileDocument[]> {
    const params = new HttpParams().set('date', date);
    return this.http.get<FileDocument[]>(`${this.apiUrl}/search/dateAfter`, { headers: this.getAuthHeaders(), params });
  }

  findByDateBefore(date: string): Observable<FileDocument[]> {
    const params = new HttpParams().set('date', date);
    return this.http.get<FileDocument[]>(`${this.apiUrl}/search/dateBefore`, { headers: this.getAuthHeaders(), params });
  }

  uploadFile(email: string, file: File, metadata: Partial<FileDocument>): Observable<User> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', metadata.title || '');
    metadata.authors?.forEach(author => formData.append('authors', author));
    metadata.affiliations?.forEach(affiliation => formData.append('affiliations', affiliation));
    metadata.keywords?.forEach(keyword => formData.append('keywords', keyword));
    formData.append('publicationDate', metadata.publicationDate || '');
    formData.append('abstractText', metadata.abstractText || '');
    if (metadata.doi) {
      formData.append('doi', metadata.doi);
    }
    formData.append('fileType', metadata.fileType || 'other');
    if (metadata.ranking) {
      formData.append('ranking', metadata.ranking);
    }

    return this.http.post<User>(`${this.userApiUrl}/${email}/uploads`, formData, { headers: this.getAuthHeaders() });
  }

  updateFile(id: string, updatedMetadata: Partial<FileDocument>): Observable<FileDocument> {
    // Note: The Spring Boot controller uses @RequestBody for PUT /api/files/{id}, 
    // so we send the updatedMetadata object directly as JSON.
    return this.http.put<FileDocument>(
      `${this.apiUrl}/${id}`, 
      updatedMetadata, 
      { headers: this.getAuthHeaders() }
    );
  }
}