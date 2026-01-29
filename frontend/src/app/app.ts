import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';

import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, CommonModule],
    templateUrl: './app.html'
})
export class App {
    title = 'frontend';
    currentDate = new Date();
    hideHeaderFooter = false;

    constructor(private router: Router) { }

    ngOnInit() {
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe((event: any) => {
            this.hideHeaderFooter = event.url === '/login' ||
                event.url === '/' ||
                event.url === '' ||
                event.url === '/inscription';
        });
    }

    shouldShowHeaderFooter(): boolean {
        return !this.hideHeaderFooter;
    }
}