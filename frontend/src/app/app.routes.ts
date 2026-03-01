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
import { boutiqueAuthGuard } from './guards/boutique-auth.guard';
import { CommissionTypeComponent } from './auth/admin/commission-type/commission-type.component';
import { BoutiqueSetupComponent } from './auth/boutique/boutique-setup/boutique-setup';
import { MonAbonnementComponent } from './component_boutique/mon-abonnement/mon-abonnement';
import { CreateProduit } from './component_boutique/produit/create-produit/create-produit';
import { ListProduit } from './component_boutique/produit/list-produit/list-produit';
import { StockProduit } from './component_boutique/produit/stock-produit/stock-produit';
import { ListeProduitClient } from './component_client/produit/liste-produit-client/liste-produit-client';
import { ListeBoutiqueClient } from './component_client/produit/liste-boutique-client/liste-boutique-client';
import { ListePanier } from './component_client/produit/liste-panier/liste-panier';
import { SuiviCommande } from './component_client/produit/suivi-commande/suivi-commande';
import { SuiviCommandeBoutique } from './component_boutique/suivi-commande-boutique/suivi-commande-boutique';
import { ListeBoutiqueAdmin } from './auth/admin/liste-boutique-admin/liste-boutique-admin';
import { StatAdmin } from './auth/admin/stat-admin/stat-admin';

export const routes: Routes = [
    { path: '', redirectTo: '/accueil-general', pathMatch: 'full' },
    { path: 'login', component: Login },
    { path: 'inscription', component: Inscription },
    {
        path: 'test',
        component: DashboardComponent,
        canActivate: [boutiqueAuthGuard]
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
    { path: 'boutique-setup', component: BoutiqueSetupComponent, canActivate: [boutiqueAuthGuard] },
    { path: 'mon-abonnement', component: MonAbonnementComponent, canActivate: [boutiqueAuthGuard] },
    { path: 'create-produit', component: CreateProduit, canActivate: [boutiqueAuthGuard] },
    { path: 'liste-produit', component: ListProduit, canActivate: [boutiqueAuthGuard] },
    { path: 'stock-produit', component: StockProduit, canActivate: [boutiqueAuthGuard] },
    { path: 'commandes-boutique', component: SuiviCommandeBoutique, canActivate: [boutiqueAuthGuard] },
    { path: 'liste-produit-client', component: ListeProduitClient, canActivate: [authGuard] },
    { path: 'liste-boutique-client', component: ListeBoutiqueClient, canActivate: [authGuard] },
    { path: 'liste-panier', component: ListePanier, canActivate: [authGuard] },
    { path: 'suivi-commandes', component: SuiviCommande, canActivate: [authGuard] },
    { path: 'typecommission', component: CommissionTypeComponent },
    { path: 'liste-boutique-admin', component: ListeBoutiqueAdmin },
    { path: 'stat-admin', component: StatAdmin },
    { path: 'login-boutique', component: LoginBoutique },
    { path: 'inscription-admin', component: InscriptionAdmin },
    { path: 'login-admin', component: LoginAdmin },
    { path: '**', redirectTo: '/login' }
];