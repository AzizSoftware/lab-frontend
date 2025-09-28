import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FileDocument {
  id?: string;
  title: string;
  keyword: string;
  author: string;
  date: string; // Using string for date consistency with frontend-backend interaction
  filePath?: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private apiUrl = 'http://localhost:8087/api/files';

  constructor(private http: HttpClient) {}

  // -------------------- CRUD Endpoints --------------------

  getAllFiles(): Observable<FileDocument[]> {
    return this.http.get<FileDocument[]>(this.apiUrl);
  }

  getFileById(id: string): Observable<FileDocument> {
    return this.http.get<FileDocument>(`${this.apiUrl}/${id}`);
  }

  createFile(file: FileDocument): Observable<FileDocument> {
    return this.http.post<FileDocument>(this.apiUrl, file);
  }

  updateFile(id: string, file: FileDocument): Observable<FileDocument> {
    return this.http.put<FileDocument>(`${this.apiUrl}/${id}`, file);
  }

  deleteFile(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // -------------------- Count Endpoint --------------------

  countFiles(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count`);
  }

  // -------------------- Search & Filter Endpoints --------------------

  findByTitle(title: string): Observable<FileDocument[]> {
    const params = new HttpParams().set('title', title);
    return this.http.get<FileDocument[]>(`${this.apiUrl}/search/title`, { params });
  }

  findByKeyword(keyword: string): Observable<FileDocument[]> {
    const params = new HttpParams().set('keyword', keyword);
    return this.http.get<FileDocument[]>(`${this.apiUrl}/search/keyword`, { params });
  }

  findByAuthor(author: string): Observable<FileDocument[]> {
    const params = new HttpParams().set('author', author);
    return this.http.get<FileDocument[]>(`${this.apiUrl}/search/author`, { params });
  }

  findByDateAfter(date: string): Observable<FileDocument[]> {
    const params = new HttpParams().set('date', date);
    return this.http.get<FileDocument[]>(`${this.apiUrl}/search/dateAfter`, { params });
  }

  findByDateBefore(date: string): Observable<FileDocument[]> {
    const params = new HttpParams().set('date', date);
    return this.http.get<FileDocument[]>(`${this.apiUrl}/search/dateBefore`, { params });
  }
}