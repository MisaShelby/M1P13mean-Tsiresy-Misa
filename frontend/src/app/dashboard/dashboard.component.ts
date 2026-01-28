import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './dashboard.component.html',
})

export class DashboardComponent implements OnInit {
    healthStatus: any = null;
    loading: boolean = false;
    error: string = '';

    constructor(
      private apiService: ApiService,
      private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
      this.checkBackendConnection();
    }

    checkBackendConnection(): void {
        this.loading = true;
        this.healthStatus = null;
        this.error = '';

        this.cdr.detectChanges();

        setTimeout(() => {
            this.apiService.checkHealth().subscribe({
              next: (response) => {
                  console.log('Réponse reçue:', response);
                  this.healthStatus = response;
                  this.loading = false;
                  this.cdr.detectChanges();
              },
              error: (err) => {
                  console.error('Erreur:', err);
                  this.error = `❌ Impossible de se connecter au backend: ${err.message}`;
                  this.loading = false;
                  this.cdr.detectChanges();
              }
            });
        }, 1000);
    }
}