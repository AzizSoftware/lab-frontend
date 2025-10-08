import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; 
import { HomeComponent } from './pages/home/home.component';
import { EventComponent } from './pages/event/event.component';
import { ProjectComponent } from './pages/project/project.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { provideHttpClient } from '@angular/common/http'; 
import { RouterModule } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { FileComponent } from './pages/file/file.component';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AdminConsoleComponent } from './pages/admin/admin-console/admin-console.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    EventComponent,
    ProjectComponent,
    ProfileComponent,
    LoginComponent,
    SignupComponent,
    FileComponent,
    AdminConsoleComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CommonModule,
    FormsModule,
    MatSnackBarModule,
    ReactiveFormsModule, 
    BrowserAnimationsModule, // Required for Angular Material
    MatTableModule, // For mat-table and dataSource
    MatTabsModule, // For mat-tab-group and mat-tab
    MatIconModule, // For mat-icon
    MatButtonModule,
    RouterModule.forRoot([]) 
  ],
  providers: [
    provideHttpClient(),
    provideAnimationsAsync() 
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
