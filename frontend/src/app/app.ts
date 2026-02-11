import { CommonModule, DatePipe } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NotificationComponent } from './notification/notification.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, CommonModule, NotificationComponent, MatIconModule],
    templateUrl: './app.html',
})
export class App {
    title = 'frontend';
    currentDate = new Date();
    hideHeaderFooter = false;
    isScrolled = false;

    constructor(private router: Router) { }

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
                event.url === '/login-admin';
        });
    }

    isAccueilGeneral(): boolean {
    return this.router.url === '/accueil-general';
}


    shouldShowHeaderFooter(): boolean {
        return !this.hideHeaderFooter;
    }

    logout(): void {
        localStorage.removeItem('token');
        this.router.navigate(['/accueil-general']);
    }

    isLoggedIn(): boolean {
        return !!localStorage.getItem('token');
    }

}