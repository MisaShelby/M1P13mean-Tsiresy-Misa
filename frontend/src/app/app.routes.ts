import { DashboardComponent } from './dashboard/dashboard.component';
import { Login } from './login/login';
import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: Login },
    { path: 'test', component: DashboardComponent },
    { path: '**', redirectTo: '/test' }
];