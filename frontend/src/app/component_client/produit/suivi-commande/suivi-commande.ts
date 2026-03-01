import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-suivi-commande',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './suivi-commande.html',
})
export class SuiviCommande implements OnInit {
  commandes: any[] = [];
  loading = false;
  commandeOuverte: string | null = null;

  etapes = [
    { statut: 'en cours de preparation', label: 'En cours de préparation', icon: 'inventory_2', color: 'orange' },
    { statut: 'expedie', label: 'Expédié', icon: 'local_shipping', color: 'blue' },
    { statut: 'deja livre', label: 'Déjà livré', icon: 'check_circle', color: 'green' }
  ];

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
    this.apiService.getMesCommandes().subscribe({
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

  getEtapeIndex(statut: string): number {
    return this.etapes.findIndex(e => e.statut === statut);
  }

  isEtapeAtteinte(commandeStatut: string, etapeStatut: string): boolean {
    return this.getEtapeIndex(commandeStatut) >= this.getEtapeIndex(etapeStatut);
  }

  isEtapeActive(commandeStatut: string, etapeStatut: string): boolean {
    return commandeStatut === etapeStatut;
  }

  getStatutBadgeClass(statut: string): string {
    switch (statut) {
      case 'en cours de preparation': return 'bg-orange-100 text-orange-700';
      case 'expedie': return 'bg-blue-100 text-blue-700';
      case 'deja livre': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  }

  getStatutLabel(statut: string): string {
    switch (statut) {
      case 'en cours de preparation': return 'En cours de préparation';
      case 'expedie': return 'Expédié';
      case 'deja livre': return 'Déjà livré';
      default: return statut;
    }
  }

  getPaiementIcon(paiement: string): string {
    return paiement === 'Mvola' ? 'phone_android' : 'credit_card';
  }

  getPaiementClass(paiement: string): string {
    return paiement === 'Mvola' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700';
  }

  getDateEtape(commande: any, etapeStatut: string): Date | null {
    switch (etapeStatut) {
      case 'en cours de preparation': return commande.date_commande;
      case 'expedie': return commande.date_commande; // Updated when status changes
      case 'deja livre': return commande.date_livraison;
      default: return null;
    }
  }

  retourPaniers(): void {
    this.router.navigate(['/liste-panier']);
  }

  retourProduits(): void {
    this.router.navigate(['/liste-produit-client']);
  }

  countByStatut(statut: string): number {
    return this.commandes.filter(c => c.statut === statut).length;
  }
}
