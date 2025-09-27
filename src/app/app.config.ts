// src/app/app.config.ts

import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http'; // ⬅️ IMPORT THIS

import { routes } from './app-routing.module';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient() // ⬅️ ADD THIS FUNCTIONAL PROVIDER
    // If you need interceptors from modules: provideHttpClient(withInterceptorsFromDi()),
  ]
};