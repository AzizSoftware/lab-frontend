import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module'; // Import the main module

// This is the classic way to bootstrap, which correctly loads AppModule 
// and all its imported dependencies (like CommonModule and FormsModule).
platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));

// NOTE: You can now remove 'bootstrapApplication' and 'appConfig' imports.
