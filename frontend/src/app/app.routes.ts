import { AccueilGeneral } from './auth/accueil_general/accueil_general';
import { DashboardComponent } from './dashboard/dashboard.component';
import { Inscription } from './auth/client/inscription/inscription';
import { InscriptionAdmin } from './auth/admin/inscription_admin/inscription_admin';
import { InscriptionBoutique } from './auth/boutique/inscription_boutique/inscription_boutique';
import { Login } from './auth/client/login/login';
import { LoginAdmin } from './auth/admin/login_admin/login_admin';
import { LoginBoutique } from './auth/boutique/login_boutique/login_boutique';
import { Routes } from '@angular/router';
import { ValidationInscriBoutique } from './auth/admin/validation-inscri-boutique/validation-inscri-boutique';
import { authGuard } from './guards/auth.guard';

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
        path: 'validation-isncri-boutique',
        component: ValidationInscriBoutique,
        canActivate: [authGuard]
    },
    {
        path: 'accueil-general',
        component: AccueilGeneral
    },
    { path: 'inscription-boutique', component: InscriptionBoutique },
    { path: 'login-boutique', component: LoginBoutique },
    { path: 'inscription-admin', component: InscriptionAdmin },
    { path: 'login-admin', component: LoginAdmin },
    { path: '**', redirectTo: '/login' }
];