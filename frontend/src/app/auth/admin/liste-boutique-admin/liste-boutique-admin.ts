import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-liste-boutique-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, RouterModule],
  templateUrl: './liste-boutique-admin.html',
})
export class ListeBoutiqueAdmin implements OnInit {
  boutiques: any[] = [];
  filteredBoutiques: any[] = [];
  loading = false;
  searchText = '';
  filterStatut = 'all';
  selectedBoutique: any = null;
  sortField = 'createdAt';
  sortOrder = 'desc';

  constructor(
    private apiService: ApiService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.chargerBoutiques();
  }

  chargerBoutiques(): void {
    this.loading = true;
    this.apiService.getBoutiquesAdmin().subscribe({
      next: (res: any) => {
        this.boutiques = res.boutiques || [];
        this.appliquerFiltres();
        this.loading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.notification.error('Erreur lors du chargement des boutiques');
        this.loading = false;
      }
    });
  }

  appliquerFiltres(): void {
    let result = [...this.boutiques];

    // Filtre par statut
    if (this.filterStatut !== 'all') {
      if (this.filterStatut === 'validee') {
        result = result.filter(b => b.statut_demande === 1 && b.statut_general === 1);
      } else if (this.filterStatut === 'en_attente') {
        result = result.filter(b => b.statut_demande === 2);
      } else if (this.filterStatut === 'refusee') {
        result = result.filter(b => b.statut_demande === 0);
      } else if (this.filterStatut === 'desactivee') {
        result = result.filter(b => b.statut_demande === 1 && b.statut_general === 0);
      }
    }

    // Filtre par recherche
    if (this.searchText.trim()) {
      const search = this.searchText.toLowerCase();
      result = result.filter(b =>
        b.nom_boutique?.toLowerCase().includes(search) ||
        b.nom_gerant?.toLowerCase().includes(search) ||
        b.email?.toLowerCase().includes(search)
      );
    }

    // Tri
    result.sort((a, b) => {
      const order = this.sortOrder === 'asc' ? 1 : -1;
      if (this.sortField === 'nom_boutique') {
        return a.nom_boutique.localeCompare(b.nom_boutique) * order;
      } else if (this.sortField === 'nombre_produits') {
        return (a.nombre_produits - b.nombre_produits) * order;
      } else if (this.sortField === 'nombre_commandes') {
        return (a.nombre_commandes - b.nombre_commandes) * order;
      } else if (this.sortField === 'chiffre_affaires') {
        return (a.chiffre_affaires - b.chiffre_affaires) * order;
      } else if (this.sortField === 'portefeuille') {
        return (a.portefeuille - b.portefeuille) * order;
      } else {
        return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * order;
      }
    });

    this.filteredBoutiques = result;
  }

  toggleSort(field: string): void {
    if (this.sortField === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortOrder = 'desc';
    }
    this.appliquerFiltres();
  }

  getStatutLabel(boutique: any): string {
    if (boutique.statut_demande === 2) return 'En attente';
    if (boutique.statut_demande === 0) return 'Refusée';
    if (boutique.statut_general === 0) return 'Désactivée';
    return 'Active';
  }

  getStatutClass(boutique: any): string {
    if (boutique.statut_demande === 2) return 'bg-yellow-100 text-yellow-800';
    if (boutique.statut_demande === 0) return 'bg-red-100 text-red-800';
    if (boutique.statut_general === 0) return 'bg-gray-100 text-gray-800';
    return 'bg-green-100 text-green-800';
  }

  ouvrirDetail(boutique: any): void {
    this.selectedBoutique = boutique;
  }

  fermerDetail(): void {
    this.selectedBoutique = null;
  }

  formatDate(date: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  formatMontant(montant: number): string {
    return (montant || 0).toLocaleString('fr-FR') + ' Ar';
  }

  get totalCA(): number {
    return this.filteredBoutiques.reduce((s, b) => s + (b.chiffre_affaires || 0), 0);
  }

  get totalProduits(): number {
    return this.filteredBoutiques.reduce((s, b) => s + (b.nombre_produits || 0), 0);
  }

  get totalCommandes(): number {
    return this.filteredBoutiques.reduce((s, b) => s + (b.nombre_commandes || 0), 0);
  }
}
