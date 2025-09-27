import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; 
import { HomeComponent } from './pages/home/home.component';
import { EventComponent } from './pages/event/event.component';
// NOTE: HttpClientModule removed and replaced with provideHttpClient in providers
import { provideHttpClient } from '@angular/common/http'; // <-- NEW: Import the functional provider

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    EventComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CommonModule,
    FormsModule,
    // HttpClientModule has been removed here to fix the deprecation warning
  ],
  providers: [
    // This functional provider replaces HttpClientModule and resolves the dependency injection error.
    provideHttpClient() 
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }