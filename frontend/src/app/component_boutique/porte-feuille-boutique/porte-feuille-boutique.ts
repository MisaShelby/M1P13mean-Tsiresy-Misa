import { Component, EventEmitter, Input, Output } from '@angular/core';

import { AuthBoutiqueService } from '../../auth/boutique/auth_boutique.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-porte-feuille-boutique',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './porte-feuille-boutique.html',
})
export class PorteFeuilleBoutique {
    @Input() soldeActuel: number = 0;
    @Output() rechargeEffectuee = new EventEmitter<number>();

    montant: number | null = null;
    isLoading = false;
    successMessage: string | null = null;
    errorMessage: string | null = null;

    montantsRapides = [5000, 10000, 25000, 50000, 100000];

    private apiUrl = `${environment.apiUrl}/auth`;

    constructor(
        private http: HttpClient,
        private authService: AuthBoutiqueService
    ) { }

    selectMontantRapide(montant: number): void {
        this.montant = montant;
        this.successMessage = null;
        this.errorMessage = null;
    }

    recharger(): void {
        if (!this.montant || this.montant <= 0 || this.isLoading) return;

        this.isLoading = true;
        this.successMessage = null;
        this.errorMessage = null;

        const headers = { Authorization: `Bearer ${this.authService.getToken()}` };

        this.http.post<any>(`${this.apiUrl}/recharger-portefeuille`, {
            montant: this.montant
        }, { headers }).subscribe({
            next: (res) => {
                if (res.success) {
                    this.successMessage = res.message;
                    this.soldeActuel = res.nouveau_solde;
                    this.rechargeEffectuee.emit(res.nouveau_solde);
                    this.montant = null;
                    if (res.boutique) {
                        localStorage.setItem('boutique', JSON.stringify(res.boutique));
                    }
                }
                this.isLoading = false;
            },
            error: (err) => {
                this.errorMessage = err.error?.message || 'Erreur lors du rechargement';
                this.isLoading = false;
            }
        });
    }
}
