import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { EventComponent } from './pages/event/event.component';
import { ProjectComponent } from './pages/project/project.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { FileComponent } from './pages/file/file.component';
import { AdminConsoleComponent } from './pages/admin/admin-console/admin-console.component';



export const routes: Routes = [

 
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'event', component: EventComponent},
  { path: 'project',component:ProjectComponent},
  { path: 'profile', component:ProfileComponent},
  { path: 'login', component:LoginComponent},
  { path: 'signup', component:SignupComponent},
  { path: 'file',component:FileComponent},

  { path: 'admin-consol',component:AdminConsoleComponent}
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
