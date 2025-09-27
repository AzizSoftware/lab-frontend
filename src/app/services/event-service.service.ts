import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http'; // Added HttpParams
import { Observable } from 'rxjs';

export interface Event {
  id?: string;
  eventName: string;
  location: string;
  budget: number;
  maxParticipants: number;
  availablePlaces?: number;
  status: string;
  startDate: string; // Using string for date/time consistency with backend
  endDate: string;
  description: string;
  image?: string;
  imagePath?: string;
  enrolledUsers?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  // Respecting the port you provided in your code snippet
  private apiUrl = 'http://localhost:8087/api/events';

  constructor(private http: HttpClient) {}

  // -------------------- CRUD Endpoints --------------------

  getAllEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(this.apiUrl);
  }

  getEventById(id: string): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/${id}`);
  }

  createEvent(event: Event): Observable<Event> {
    return this.http.post<Event>(this.apiUrl, event);
  }

  updateEvent(id: string, event: Event): Observable<Event> {
    return this.http.put<Event>(`${this.apiUrl}/${id}`, event);
  }

  deleteEvent(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  enrollUser(eventId: string, userId: string): Observable<Event> {
    return this.http.post<Event>(`${this.apiUrl}/${eventId}/enroll/${userId}`, {});
  }

  getUpcomingEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/upcoming`);
  }

  // -------------------- NEW: Search & Filter Endpoints --------------------
  
  findByName(name: string): Observable<Event[]> {
    const params = new HttpParams().set('name', name);
    return this.http.get<Event[]>(`${this.apiUrl}/search/name`, { params });
  }

  findByLocation(location: string): Observable<Event[]> {
    const params = new HttpParams().set('location', location);
    return this.http.get<Event[]>(`${this.apiUrl}/search/location`, { params });
  }

  findByStatus(status: string): Observable<Event[]> {
    const params = new HttpParams().set('status', status);
    return this.http.get<Event[]>(`${this.apiUrl}/search/status`, { params });
  }

  findByBudget(min: number, max: number): Observable<Event[]> {
    const params = new HttpParams().set('min', min.toString()).set('max', max.toString());
    return this.http.get<Event[]>(`${this.apiUrl}/search/budget`, { params });
  }

  findByStartDateAfter(start: string): Observable<Event[]> {
    const params = new HttpParams().set('start', start);
    return this.http.get<Event[]>(`${this.apiUrl}/search/startAfter`, { params });
  }

  findByEndDateBefore(end: string): Observable<Event[]> {
    const params = new HttpParams().set('end', end);
    return this.http.get<Event[]>(`${this.apiUrl}/search/endBefore`, { params });
  }

  findByDateRange(start: string, end: string): Observable<Event[]> {
    const params = new HttpParams().set('start', start).set('end', end);
    return this.http.get<Event[]>(`${this.apiUrl}/search/dateRange`, { params });
  }
}