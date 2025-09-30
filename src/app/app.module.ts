import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; 
import { HomeComponent } from './pages/home/home.component';
import { EventComponent } from './pages/event/event.component';
import { ProjectComponent } from './pages/project/project.component';
import { ProfileComponent } from './profile/profile.component';
import { provideHttpClient } from '@angular/common/http'; 
import { RouterModule } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { FileComponent } from './pages/file/file.component';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    EventComponent,
    ProjectComponent,
    ProfileComponent,
    LoginComponent,
    SignupComponent,
    FileComponent
   
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CommonModule,
    FormsModule,
    MatSnackBarModule,
    ReactiveFormsModule, // ✅ should be here
    RouterModule.forRoot([]) // router enabled
  ],
  providers: [
    provideHttpClient(),
    provideAnimationsAsync() 
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
