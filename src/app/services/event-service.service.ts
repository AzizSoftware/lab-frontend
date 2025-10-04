import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Event {
  id?: string;
  eventName: string;
  location: string;
  budget: number;
  maxParticipants: number;
  availablePlaces?: number;
  status: string;
  startDate: string;
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
  private apiUrl = 'http://localhost:8087/api/events';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  getAllEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getEventById(id: string): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  createEvent(event: Event): Observable<Event> {
    return this.http.post<Event>(this.apiUrl, event, { headers: this.getHeaders() });
  }

  updateEvent(id: string, event: Event): Observable<Event> {
    return this.http.put<Event>(`${this.apiUrl}/${id}`, event, { headers: this.getHeaders() });
  }

  deleteEvent(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  enrollUser(eventId: string, userId: string): Observable<Event> {
    console.log(`Enrolling user ${userId} in event ${eventId}`);
    return this.http.post<Event>(`${this.apiUrl}/${eventId}/enroll/${userId}`, {}, { headers: this.getHeaders() });
  }

  getUpcomingEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/upcoming`, { headers: this.getHeaders() });
  }

  findByName(name: string): Observable<Event[]> {
    const params = new HttpParams().set('name', name);
    return this.http.get<Event[]>(`${this.apiUrl}/search/name`, { params, headers: this.getHeaders() });
  }

  findByLocation(location: string): Observable<Event[]> {
    const params = new HttpParams().set('location', location);
    return this.http.get<Event[]>(`${this.apiUrl}/search/location`, { params, headers: this.getHeaders() });
  }

  findByStatus(status: string): Observable<Event[]> {
    const params = new HttpParams().set('status', status);
    return this.http.get<Event[]>(`${this.apiUrl}/search/status`, { params, headers: this.getHeaders() });
  }

  findByBudget(min: number, max: number): Observable<Event[]> {
    const params = new HttpParams().set('min', min.toString()).set('max', max.toString());
    return this.http.get<Event[]>(`${this.apiUrl}/search/budget`, { params, headers: this.getHeaders() });
  }

  findByStartDateAfter(start: string): Observable<Event[]> {
    const params = new HttpParams().set('start', start);
    return this.http.get<Event[]>(`${this.apiUrl}/search/startAfter`, { params, headers: this.getHeaders() });
  }

  findByEndDateBefore(end: string): Observable<Event[]> {
    const params = new HttpParams().set('end', end);
    return this.http.get<Event[]>(`${this.apiUrl}/search/endBefore`, { params, headers: this.getHeaders() });
  }

  findByDateRange(start: string, end: string): Observable<Event[]> {
    const params = new HttpParams().set('start', start).set('end', end);
    return this.http.get<Event[]>(`${this.apiUrl}/search/dateRange`, { params, headers: this.getHeaders() });
  }
}