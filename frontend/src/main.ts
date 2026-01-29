import { App } from './app/app';
import { appConfig } from './app/app.config';
import { bootstrapApplication } from '@angular/platform-browser';

// premier fichier typescript exécuté. Demarre le composant racine App avec appConfig
bootstrapApplication(App, appConfig)
    .catch((err) => console.error(err));
