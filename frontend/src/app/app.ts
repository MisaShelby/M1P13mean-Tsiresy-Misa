import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
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
    isLogin = false;

    constructor(private router: Router) {}

    ngOnInit() {
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe((event: any) => {
            this.isLogin = event.url === '/login' || event.url === '/' || event.url === '';
        });
    }

    isLoginPage(): boolean {
        return this.isLogin;
    }
}