import { AuthTypeService, UserType } from './services/auth-type.service';
import { CommonModule, DatePipe } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterModule, RouterOutlet } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';
import { NotificationComponent } from './notification/notification.component';
import { filter } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, CommonModule, NotificationComponent, MatIconModule, RouterModule,FormsModule],
    templateUrl: './app.html',
})
export class App implements OnInit {
    title = 'frontend';
    currentDate = new Date();
    hideHeaderFooter = false;
    isScrolled = false;
    userType: UserType = null;

    constructor(
        private router: Router,
        private authTypeService: AuthTypeService
    ) { }

    @HostListener('window:scroll', [])
    onWindowScroll() {
        this.isScrolled = window.scrollY > 50;
    }

    ngOnInit() {
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe((event: any) => {
            this.hideHeaderFooter = event.url === '/login' ||
                event.url === '/' ||
                event.url === '' ||
                event.url === '/inscription' ||
                event.url === '/inscription-boutique' ||
                event.url === '/login-boutique' ||
                event.url === '/inscription-admin' ||
                event.url === '/login-admin' ||
                event.url === '/boutique-setup';
        });

        // Mettre à jour le type d'utilisateur à chaque navigation
        this.router.events.subscribe(() => {
            this.userType = this.authTypeService.checkUserType();
        });

        // Vérifier initialement
        this.userType = this.authTypeService.checkUserType();
    }

    isAccueilGeneral(): boolean {
        return this.router.url === '/accueil-general';
    }

    shouldShowHeaderFooter(): boolean {
        return !this.hideHeaderFooter;
    }

    isAdmin(): boolean {
        return this.userType === 'admin';
    }

    isBoutique(): boolean {
        return this.userType === 'boutique';
    }

    isClient(): boolean {
        return this.userType === 'client';
    }

    logout(): void {
        // Appeler les services de déconnexion appropriés
        localStorage.removeItem('token');
        localStorage.removeItem('boutique_token');
        localStorage.removeItem('boutique_requires_setup');
        localStorage.removeItem('admin');
        localStorage.removeItem('boutique');
        localStorage.removeItem('user');

        this.authTypeService.logout();
        this.userType = null;

        this.router.navigate(['/accueil-general']);
    }

    isLoggedIn(): boolean {
        return !!localStorage.getItem('token')
            || !!localStorage.getItem('boutique_token')
            || !!localStorage.getItem('admin');
    }

    getBoutiquePortefeuille(): number {
        const b = localStorage.getItem('boutique');
        if (!b) return 0;
        try { return JSON.parse(b).portefeuille ?? 0; } catch { return 0; }
    }
}