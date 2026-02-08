import { DashboardComponent } from './dashboard/dashboard.component';
import { Inscription } from './auth/inscription/inscription';
import { Login } from './auth/login/login';
import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: Login },
    { path: 'inscription', component: Inscription },
    { 
        path: 'dashboard', 
        component: DashboardComponent,
        canActivate: [authGuard]
    },
    { path: 'test', component: DashboardComponent },
    { path: '**', redirectTo: '/test' }
];