import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthBoutiqueService } from '../../auth/boutique/auth_boutique.service';

export interface Paiement {
  _id: string;
  tarif: number;
  date_paiement: string;
}

export interface Abonnement {
  _id: string;
  statut: 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
  date_debut: string;
  prochain_paiement: string;
  id_commission_type: {
    _id: string;
    nom: string;
    tarif: number;
    description?: string;
  };
}

@Component({
  selector: 'app-mon-abonnement',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './mon-abonnement.html',
})
export class MonAbonnementComponent implements OnInit {
  isLoading = true;
  boutique: any = null;
  abonnement: Abonnement | null = null;
  paiements: Paiement[] = [];

  private apiUrl = 'http://mean-local.wip:8888/auth';

  constructor(
    private http: HttpClient,
    private authService: AuthBoutiqueService
  ) {}

  ngOnInit(): void {
    const headers = { Authorization: `Bearer ${this.authService.getToken()}` };
    this.http.get<any>(`${this.apiUrl}/mon-abonnement`, { headers }).subscribe({
      next: (res) => {
        if (res.success) {
          this.boutique = res.boutique;
          this.abonnement = res.abonnement;
          this.paiements = res.paiements;
          // Mettre à jour le portefeuille en localStorage
          if (res.boutique) {
            localStorage.setItem('boutique', JSON.stringify(res.boutique));
          }
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  joursRestants(): number {
    if (!this.abonnement) return 0;
    const diff = new Date(this.abonnement.prochain_paiement).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }
}
