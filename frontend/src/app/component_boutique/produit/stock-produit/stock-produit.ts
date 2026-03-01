import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { NotificationService } from '../../../services/notification.service';

interface StockItem {
  _id: string;
  id_produit: {
    _id: string;
    nom: string;
    photo: string;
    type: string;
    prix_unitaire: number;
    statut: number;
  };
  quantite: number;
}

interface ProduitSansStock {
  _id: string;
  nom: string;
  photo: string;
  type: string;
  prix_unitaire: number;
  statut: number;
}

@Component({
  selector: 'app-stock-produit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './stock-produit.html',
})
export class StockProduit implements OnInit {
  stocks: StockItem[] = [];
  produitsSansStock: ProduitSansStock[] = [];
  isLoading = true;
  errorMessage = '';

  // Modal ajout stock
  showAjoutModal = false;
  ajoutProduitId = '';
  ajoutQuantite = 1;
  ajoutLoading = false;

  // Modal modifier quantité
  showEditModal = false;
  editStock: StockItem | null = null;
  editQuantite = 0;
  editLoading = false;

  constructor(
    private apiService: ApiService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    // Charger stocks et produits en parallèle
    this.apiService.getStocks().subscribe({
      next: (res) => {
        if (res.success) {
          this.stocks = res.stocks;
        }
        this.loadProduitsSansStock();
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Erreur lors du chargement des stocks';
      }
    });
  }

  loadProduitsSansStock(): void {
    this.apiService.getListeProduits().subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          const stockedIds = new Set(this.stocks.map(s => s.id_produit._id));
          this.produitsSansStock = res.produits.filter((p: any) => !stockedIds.has(p._id));
        }
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  getStatutLabel(statut: number): string {
    return statut === 1 ? 'Activé' : 'Désactivé';
  }

  getStatutClass(statut: number): string {
    return statut === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
  }

  getStockLevelClass(quantite: number): string {
    if (quantite === 0) return 'text-red-600 bg-red-50';
    if (quantite <= 5) return 'text-orange-600 bg-orange-50';
    return 'text-green-600 bg-green-50';
  }

  getStockLevelLabel(quantite: number): string {
    if (quantite === 0) return 'Rupture de stock';
    if (quantite <= 5) return 'Stock faible';
    return 'En stock';
  }

  // --- Ajout stock ---
  openAjout(): void {
    this.ajoutProduitId = '';
    this.ajoutQuantite = 1;
    this.showAjoutModal = true;
  }

  closeAjout(): void {
    this.showAjoutModal = false;
  }

  submitAjout(): void {
    if (!this.ajoutProduitId || this.ajoutQuantite <= 0) {
      this.notification.error('Veuillez sélectionner un produit et une quantité valide');
      return;
    }

    this.ajoutLoading = true;
    this.apiService.ajouterStock(this.ajoutProduitId, this.ajoutQuantite).subscribe({
      next: (res) => {
        this.ajoutLoading = false;
        if (res.success) {
          this.notification.success(res.message);
          this.closeAjout();
          this.loadData();
        } else {
          this.notification.error(res.message);
        }
      },
      error: (err) => {
        this.ajoutLoading = false;
        this.notification.error(err.error?.message || 'Erreur serveur');
      }
    });
  }

  // --- Modifier quantité ---
  openEdit(s: StockItem): void {
    this.editStock = s;
    this.editQuantite = s.quantite;
    this.showEditModal = true;
  }

  closeEditStock(): void {
    this.showEditModal = false;
    this.editStock = null;
  }

  submitEditStock(): void {
    if (!this.editStock || this.editQuantite < 0) {
      this.notification.error('Quantité invalide');
      return;
    }

    this.editLoading = true;
    this.apiService.updateStock(this.editStock.id_produit._id, this.editQuantite).subscribe({
      next: (res) => {
        this.editLoading = false;
        if (res.success) {
          this.notification.success('Stock mis à jour !');
          this.closeEditStock();
          this.loadData();
        } else {
          this.notification.error(res.message);
        }
      },
      error: (err) => {
        this.editLoading = false;
        this.notification.error(err.error?.message || 'Erreur serveur');
      }
    });
  }

  countStockFaible(): number {
    return this.stocks.filter(s => s.quantite > 0 && s.quantite <= 5).length;
  }

  countRupture(): number {
    return this.stocks.filter(s => s.quantite === 0).length;
  }
}
