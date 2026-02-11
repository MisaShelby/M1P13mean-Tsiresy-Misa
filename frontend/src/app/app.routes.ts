import { DashboardComponent } from './dashboard/dashboard.component';
import { Inscription } from './auth/client/inscription/inscription';
import { Login } from './auth/client/login/login';
import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { AccueilGeneral } from './auth/accueil_general/accueil_general';
import { InscriptionBoutique } from './auth/boutique/inscription_boutique/inscription_boutique';
import { LoginBoutique } from './auth/boutique/login_boutique/login_boutique';
import { InscriptionAdmin } from './auth/admin/inscription_admin/inscription_admin';
import { LoginAdmin } from './auth/admin/login_admin/login_admin';

export const routes: Routes = [
    { path: '', redirectTo: '/accueil-general', pathMatch: 'full' },
    { path: 'login', component: Login },
    { path: 'inscription', component: Inscription },
    { 
        path: 'test', 
        component: DashboardComponent,
        canActivate: [authGuard]
    },
    {
        path:'accueil-general',
        component: AccueilGeneral
    },
    { path:'inscription-boutique', component : InscriptionBoutique },
    { path:'login-boutique', component : LoginBoutique },
    { path:'inscription-admin', component : InscriptionAdmin },
    { path:'login-admin', component : LoginAdmin },
    { path: '**', redirectTo: '/login' }
];