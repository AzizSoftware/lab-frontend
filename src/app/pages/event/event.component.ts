// src/app/pages/event/event.component.ts

import { Component, OnInit } from '@angular/core';
import { EventService, Event } from '../../services/event-service.service';
import { forkJoin, Observable, of } from 'rxjs'; // Import forkJoin and of
import { switchMap, catchError } from 'rxjs/operators'; // Import operators
import { AuthService } from '../../services/auth-service.service';

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.css']
})
export class EventComponent implements OnInit {
  isLoggedIn: boolean = false;  
  events: Event[] = [];
  // 1. ADDED: Array to hold the events displayed after filtering
  filteredEvents: Event[] = []; 
  loading = true;
  errorMessage = '';

  // Properties for two-way data binding ([(ngModel)])
  searchTerm: string = '';
  // NOTE: Assuming "Event Type" is an internal classification not directly on the model or service as a filter.
  // We'll keep it for the UI but won't use it in the backend service call unless you add a 'findByType' endpoint.
  selectedEventType: string = ''; 
  selectedEventStatus: string = '';

  // Property for the modal state
  isModalOpen: boolean = false; 


  newEvent: Event = {
    eventName: '',
    location: '',
    budget: 0,
    maxParticipants: 0,
    status: 'UPCOMING',   // default status
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
    description: '',
    
    enrolledUsers: []
  };
  
  constructor(
    private eventService: EventService,
    private authService: AuthService   // <-- added 'private' so it's a class property
  ) {}

  ngOnInit(): void {
    this.fetchEvents();
    this.isLoggedIn = this.authService.isLoggedIn();
  }

  logout(): void {
    this.authService.logout();
    this.isLoggedIn = false;  // Update local flag after logout
  }

  fetchEvents(): void {
    this.loading = true;
    this.eventService.getAllEvents().subscribe({
      next: (data) => {
        this.events = data;
        // 2. IMPORTANT: Initialize filteredEvents with all events on load
        this.filteredEvents = data; 
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to load events';
        this.loading = false;
      }
    });
  }

  // 3. ADDED: Method to handle all filtering logic
  applyFilters(): void {
    this.loading = true;
    this.errorMessage = '';
    
    // Determine which service calls to make
    const searchByName$ = this.searchTerm 
      ? this.eventService.findByName(this.searchTerm) 
      : of(this.events); // Use all fetched events if no name search

    const searchByStatus$ = this.selectedEventStatus 
      ? this.eventService.findByStatus(this.selectedEventStatus) 
      : of(this.events); // Use all fetched events if no status filter

    // Combine the Observable results
    // NOTE: This logic assumes that the service endpoints work in isolation.
    // A robust solution usually involves filtering the *local* 'events' array 
    // or using a combined backend endpoint (e.g., /search?name=X&status=Y).
    // For simplicity, we'll demonstrate using 'findByName' and falling back to a local filter if both are set.
    
    // Strategy: First filter by name, then filter that result locally by status.
    searchByName$.pipe(
      // The map ensures we catch the server-side result (or the local events array)
      catchError(err => {
        this.errorMessage = 'Search failed.';
        this.loading = false;
        return of([]); // Return an empty array on error
      })
    ).subscribe((nameFilteredEvents) => {
      let finalEvents = nameFilteredEvents;

      // Local filter for status (since you only have a single-parameter findByStatus endpoint)
      if (this.selectedEventStatus && nameFilteredEvents.length > 0) {
        finalEvents = nameFilteredEvents.filter(event => 
          event.status.toLowerCase() === this.selectedEventStatus.toLowerCase()
        );
      }
      
      this.filteredEvents = finalEvents;
      this.loading = false;
      
      if (this.filteredEvents.length === 0) {
        this.errorMessage = 'No events found matching your criteria.';
      } else {
        this.errorMessage = '';
      }
    });

    // Resetting to all events if both filters are cleared
    if (!this.searchTerm && !this.selectedEventStatus) {
      this.filteredEvents = this.events;
      this.errorMessage = '';
      this.loading = false;
    }
  }

  // Method to open the event creation modal.
  openModal(): void {
    this.isModalOpen = true;
  }

  // Method to close the event creation modal.
  closeModal(): void {
    this.isModalOpen = false;
  }

  onSubmit(): void {
    this.eventService.createEvent(this.newEvent).subscribe({
      next: (createdEvent) => {
        // add it locally
        this.events.push(createdEvent);
        this.filteredEvents.push(createdEvent);

        // reset form
        this.newEvent = {
          eventName: '',
          location: '',
          budget: 0,
          maxParticipants: 0,
          status: 'UPCOMING',
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
          description: '',
          enrolledUsers: []
        };

        this.closeModal();
      },
      error: (err) => {
        console.error('Failed to create event:', err);
        this.errorMessage = 'Failed to create event';
      }
    });
  }

  // Method to handle various actions
  eventAction(action: string, id: string | number | undefined): void {
    console.log(`Action: ${action} requested for Event ID: ${id}`);
    // Future logic: routing, register service call, etc.
  }
}