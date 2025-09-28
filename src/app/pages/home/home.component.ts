// home.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth-service.service';
import { EventService, Event } from '../../services/event-service.service';
import { forkJoin, Observable, of } from 'rxjs'; // Import forkJoin and of
import { switchMap, catchError } from 'rxjs/operators'; // Import operators


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  isLoggedIn: boolean = false;
  events: Event[] = [];
  constructor(private authService: AuthService, private eventService: EventService) {}

  ngOnInit() {
    this.isLoggedIn = this.authService.isLoggedIn();
    forkJoin({
      ongoing: this.eventService.findByStatus('ONGOING'),
      upcoming: this.eventService.getUpcomingEvents()
    }).subscribe({
      next: (res) => {
        const ongoingLimited = res.ongoing.slice(0, 3);
        const upcomingLimited = res.upcoming.slice(0, 3);
        this.events = [...ongoingLimited, ...upcomingLimited];
      }
    });
  }

  logout() {
    this.authService.logout();
  }



}