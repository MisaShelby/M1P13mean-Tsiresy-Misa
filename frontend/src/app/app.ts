import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, CommonModule],
    templateUrl: './app.html'
})
export class App {
    title = 'frontend';
    currentDate = new Date();
}