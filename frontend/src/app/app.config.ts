import { provideHttpClient, withFetch } from '@angular/common/http';

import { ApplicationConfig } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(routes), // configuration anle route rehetra anaty app.route.ts (navigation entre les pages)
        provideHttpClient(withFetch()), // configuration ny HttpClient pour les requetes http (apirest GET, PUT, etc, ...)
        provideAnimations() //animation angular
    ]
};