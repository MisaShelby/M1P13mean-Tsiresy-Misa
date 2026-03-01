import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-suivi-commande-boutique',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './suivi-commande-boutique.html',
})
export class SuiviCommandeBoutique implements OnInit {
  commandes: any[] = [];
  loading = false;
  confirmingId: string | null = null;
  commandeOuverte: string | null = null;

  constructor(
    private apiService: ApiService,
    private notification: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.chargerCommandes();
  }

  chargerCommandes(): void {
    this.loading = true;
    this.apiService.getCommandesBoutique().subscribe({
      next: (res: any) => {
        this.commandes = res.commandes || [];
        this.loading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.notification.error('Erreur lors du chargement des commandes');
        this.loading = false;
      }
    });
  }

  toggleCommande(commandeId: string): void {
    this.commandeOuverte = this.commandeOuverte === commandeId ? null : commandeId;
  }

  isCommandeOuverte(commandeId: string): boolean {
    return this.commandeOuverte === commandeId;
  }

  confirmerPreparation(commandeId: string): void {
    this.confirmingId = commandeId;
    this.apiService.confirmerPreparationCommande(commandeId).subscribe({
      next: (res: any) => {
        if (res.toutes_confirmees) {
          this.notification.success('Commande confirmée et expédiée ! Toutes les boutiques ont validé.');
        } else {
          this.notification.success(`Préparation confirmée (${res.nb_confirmees}/${res.nb_total} boutiques)`);
        }
        this.chargerCommandes();
        this.confirmingId = null;
      },
      error: (err: any) => {
        console.error(err);
        const msg = err.error?.message || 'Erreur lors de la confirmation';
        const details = err.error?.details;
        if (details && details.length > 0) {
          const detailMsg = details.map((d: any) => `${d.produit}: ${d.disponible}/${d.demande} en stock`).join(', ');
          this.notification.error(`${msg} — ${detailMsg}`);
        } else {
          this.notification.error(msg);
        }
        this.confirmingId = null;
      }
    });
  }

  getStatutCommandeClass(statut: string): string {
    switch (statut) {
      case 'en cours de preparation': return 'bg-orange-100 text-orange-700';
      case 'expedie': return 'bg-blue-100 text-blue-700';
      case 'deja livre': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  }

  getStatutCommandeLabel(statut: string): string {
    switch (statut) {
      case 'en cours de preparation': return 'En préparation';
      case 'expedie': return 'Expédié';
      case 'deja livre': return 'Livré';
      default: return statut;
    }
  }

  getConfirmationClass(statut: string): string {
    return statut === 'pret' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700';
  }

  getConfirmationLabel(statut: string): string {
    return statut === 'pret' ? 'Confirmé' : 'En attente';
  }

  countByConfirmation(statut: string): number {
    return this.commandes.filter(c => c.confirmation_statut === statut).length;
  }

  countByCommandeStatut(statut: string): number {
    return this.commandes.filter(c => c.statut === statut).length;
  }

  tousStocksSuffisants(commande: any): boolean {
    return commande.produits_boutique?.every((p: any) => p.stock_suffisant) ?? false;
  }
  getHeaderBgClass(commande: any): string {
  if (commande.confirmation_statut === 'en attente') {
    return 'bg-yellow-100';
  }

  if (
    (commande.confirmation_statut === 'pret' && commande.statut === 'en cours de preparation') ||
    commande.statut === 'deja livre'
  ) {
    return 'bg-green-100';
  }

  if (commande.statut === 'expedie') {
    return 'bg-blue-100';
  }

  return 'bg-gray-100';
}
}
