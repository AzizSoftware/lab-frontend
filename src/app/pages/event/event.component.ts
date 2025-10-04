import { Component, OnInit } from '@angular/core';
import { EventService, Event } from '../../services/event-service.service';
import { UserService } from '../../services/user-service.service';
import { AuthService } from '../../services/auth-service.service';
import { forkJoin, Observable, of } from 'rxjs';
import { switchMap, catchError, takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { User } from '../../services/models';
@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.css']
})
export class EventComponent implements OnInit {
  private destroy$ = new Subject<void>();
  isLoggedIn: boolean = false;
  isAdmin: boolean = false;
  isPermanent: boolean = false;
  isUser: boolean = false;
  currentUserId: string | null = null;
  events: Event[] = [];
  filteredEvents: Event[] = [];
  loading = true;
  errorMessage = '';

  searchTerm: string = '';
  selectedEventType: string = '';
  selectedEventStatus: string = '';

  isModalOpen: boolean = false;
  editEvent: Event | null = null;

  newEvent: Event = {
    eventName: '',
    location: '',
    budget: 0,
    maxParticipants: 0,
    status: 'UPCOMING',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    description: '',
    enrolledUsers: []
  };

  constructor(
    private eventService: EventService,
    private userService: UserService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      this.isAdmin = this.userService.isAdmin();
      this.isPermanent = this.userService.isPermanent();
      this.isUser = this.userService.isUser();
      const userEmail = this.userService.getUserEmail();
      if (userEmail) {
        this.userService.getUserByEmail(userEmail)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (user: User) => {
              this.currentUserId = user.id;
            },
            error: (err) => {
              console.error('Failed to fetch user ID', err);
              this.errorMessage = 'Failed to load user data';
              this.snackBar.open(this.errorMessage, 'Close', { duration: 3000 });
            }
          });
      }
    }
    this.fetchEvents();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  logout(): void {
    this.authService.logout();
    this.isLoggedIn = false;
    this.isAdmin = false;
    this.isPermanent = false;
    this.isUser = false;
    this.currentUserId = null;
  }

  fetchEvents(): void {
    this.loading = true;
    this.eventService.getAllEvents()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.events = data;
          this.filteredEvents = [...this.events];
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.errorMessage = 'Failed to load events';
          this.snackBar.open(this.errorMessage, 'Close', { duration: 3000 });
          this.loading = false;
        }
      });
  }

  applyFilters(): void {
    this.loading = true;
    this.errorMessage = '';

    const searchByName$ = this.searchTerm
      ? this.eventService.findByName(this.searchTerm)
      : of(this.events);

    searchByName$
      .pipe(
        switchMap((nameFilteredEvents) =>
          this.selectedEventStatus
            ? this.eventService.findByStatus(this.selectedEventStatus).pipe(
                switchMap((statusFilteredEvents) =>
                  of(
                    nameFilteredEvents.filter((event) =>
                      statusFilteredEvents.some((e) => e.id === event.id)
                    )
                  )
                )
              )
            : of(nameFilteredEvents)
        ),
        catchError((err) => {
          this.errorMessage = 'Search failed.';
          this.snackBar.open(this.errorMessage, 'Close', { duration: 3000 });
          this.loading = false;
          return of([]);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((finalEvents) => {
        let filteredEvents = finalEvents;
        if (this.selectedEventType) {
          filteredEvents = filteredEvents.filter(event =>
            event.description.toLowerCase().includes(this.selectedEventType.toLowerCase())
          );
        }
        this.filteredEvents = filteredEvents;
        this.loading = false;
        if (this.filteredEvents.length === 0) {
          this.errorMessage = 'No events found matching your criteria.';
          this.snackBar.open(this.errorMessage, 'Close', { duration: 3000 });
        } else {
          this.errorMessage = '';
        }
      });

    if (!this.searchTerm && !this.selectedEventStatus && !this.selectedEventType) {
      this.filteredEvents = [...this.events];
      this.errorMessage = '';
      this.loading = false;
    }
  }

  openModal(event?: Event): void {
    this.isModalOpen = true;
    if (event) {
      this.editEvent = { ...event };
      this.newEvent = { ...event };
    } else {
      this.editEvent = null;
      this.newEvent = {
        eventName: '',
        location: '',
        budget: 0,
        maxParticipants: 0,
        status: 'UPCOMING',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        description: '',
        enrolledUsers: []
      };
    }
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.editEvent = null;
    this.newEvent = {
      eventName: '',
      location: '',
      budget: 0,
      maxParticipants: 0,
      status: 'UPCOMING',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      description: '',
      enrolledUsers: []
    };
  }

  onSubmit(): void {
    if (!this.isAdmin) {
      this.errorMessage = 'Unauthorized to create/edit event';
      this.snackBar.open(this.errorMessage, 'Close', { duration: 3000 });
      return;
    }
    const action = this.editEvent
      ? this.eventService.updateEvent(this.editEvent.id!, this.newEvent)
      : this.eventService.createEvent(this.newEvent);
    action
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (event) => {
          if (this.editEvent) {
            const index = this.events.findIndex(e => e.id === event.id);
            this.events[index] = event;
            this.filteredEvents[index] = event;
          } else {
            this.events.push(event);
            this.filteredEvents.push(event);
          }
          this.snackBar.open(`Event ${this.editEvent ? 'updated' : 'created'} successfully`, 'Close', { duration: 3000 });
          this.closeModal();
        },
        error: (err) => {
          this.errorMessage = `Failed to ${this.editEvent ? 'update' : 'create'} event: ${err.error?.message || 'Unknown error'}`;
          this.snackBar.open(this.errorMessage, 'Close', { duration: 3000 });
        }
      });
  }

  isUserEnrolled(event: Event): boolean {
    if (!this.currentUserId || !event.enrolledUsers) return false;
    return event.enrolledUsers.includes(this.currentUserId);
  }

  eventAction(action: string, id: string | number | undefined): void {
    if (!id) {
      this.errorMessage = 'Invalid event ID';
      this.snackBar.open(this.errorMessage, 'Close', { duration: 3000 });
      return;
    }
    const eventId = id.toString();
    const event = this.events.find(e => e.id === eventId);
    if (!event) {
      this.errorMessage = 'Event not found';
      this.snackBar.open(this.errorMessage, 'Close', { duration: 3000 });
      return;
    }

    switch (action) {
      case 'Register':
        if (!this.isLoggedIn) {
          this.errorMessage = 'Please log in to register for an event';
          this.snackBar.open(this.errorMessage, 'Close', { duration: 3000 });
          return;
        }
        if (!this.isPermanent && !this.isAdmin) {
          this.errorMessage = 'Unauthorized to enroll';
          this.snackBar.open(this.errorMessage, 'Close', { duration: 3000 });
          return;
        }
        const userEmail = this.userService.getUserEmail();
        if (!userEmail) {
          this.errorMessage = 'User email not found';
          this.snackBar.open(this.errorMessage, 'Close', { duration: 3000 });
          return;
        }
        this.userService.getUserByEmail(userEmail)
          .pipe(
            switchMap((user: User) =>
              this.eventService.enrollUser(eventId, user.id).pipe(
                takeUntil(this.destroy$)
              )
            ),
            catchError((err) => {
              this.errorMessage = err.error?.message || 'Enrollment failed';
              this.snackBar.open(this.errorMessage, 'Close', { duration: 3000 });
              return of(null);
            }),
            takeUntil(this.destroy$)
          )
          .subscribe({
            next: (updatedEvent) => {
              if (updatedEvent) {
                const index = this.events.findIndex(e => e.id === eventId);
                this.events[index] = updatedEvent;
                this.filteredEvents[index] = updatedEvent;
                this.snackBar.open(`Successfully enrolled in ${event.eventName}`, 'Close', { duration: 3000 });
              }
            },
            error: (err) => {
              this.errorMessage = err.error?.message || 'Failed to fetch user data';
              this.snackBar.open(this.errorMessage, 'Close', { duration: 3000 });
            }
          });
        break;
      case 'Details':
        this.snackBar.open(`Event Details:\n${event.eventName}\nStatus: ${event.status}\nLocation: ${event.location}\nBudget: $${event.budget}\nParticipants: ${event.enrolledUsers?.length || 0}/${event.maxParticipants}`, 'Close', {
          duration: 5000,
          verticalPosition: 'top'
        });
        break;
      case 'Join Event':
      case 'View Materials':
        console.log(`Action: ${action} for Event ID: ${eventId}`);
        // Add specific logic if needed
        break;
      case 'Edit':
        if (this.isAdmin) {
          this.openModal(event);
        } else {
          this.errorMessage = 'Unauthorized to edit';
          this.snackBar.open(this.errorMessage, 'Close', { duration: 3000 });
        }
        break;
      case 'Delete':
        if (this.isAdmin) {
          this.eventService.deleteEvent(eventId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                this.events = this.events.filter((e) => e.id !== eventId);
                this.filteredEvents = this.filteredEvents.filter((e) => e.id !== eventId);
                this.snackBar.open('Event deleted successfully', 'Close', { duration: 3000 });
              },
              error: (err) => {
                this.errorMessage = `Failed to delete event: ${err.error?.message || 'Unknown error'}`;
                this.snackBar.open(this.errorMessage, 'Close', { duration: 3000 });
              }
            });
        } else {
          this.errorMessage = 'Unauthorized to delete';
          this.snackBar.open(this.errorMessage, 'Close', { duration: 3000 });
        }
        break;
    }
  }
}