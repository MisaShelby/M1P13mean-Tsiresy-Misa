import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../../services/api.service';
import { NotificationService } from '../../../services/notification.service';

export interface Produit {
  _id: string;
  nom: string;
  photo: string;
  description: string;
  prix_unitaire: number;
  type: string;
  statut: number;
  createdAt: string;
}

export interface Promotion {
  _id: string;
  id_produit: any;
  type_promotion: string;
  pourcentage: number;
  code_promo: string;
  date_debut: string;
  date_fin: string;
  statut: number;
  createdAt: string;
}

@Component({
  selector: 'app-list-produit',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule],
  templateUrl: './list-produit.html',
})
export class ListProduit implements OnInit {
  produits: Produit[] = [];
  isLoading = true;
  errorMessage = '';
  stockMap: Map<string, number> = new Map();
  promoMap: Map<string, Promotion[]> = new Map();

  searchText = '';
  filterType = '';
  filterStatut: string = '';
  filterPrixMin: number | null = null;
  filterPrixMax: number | null = null;

    sortBy = 'createdAt';
  sortOrder: 'asc' | 'desc' = 'asc';

  types: string[] = ['Aliment', '\u00c9lectronique', 'Cosm\u00e9tique', 'Mobilier', 'Informatique'];
  totalCount = 0;

  showEditModal = false;
  editLoading = false;
  editPhotoPreview: string | null = null;
  editProduit: any = {};

  showPromoModal = false;
  promoLoading = false;
  promoProduit: Produit | null = null;
  produitPromos: Promotion[] = [];
  newPromo: any = { type_promotion: 'POURCENTAGE', pourcentage: 0, code_promo: '', date_debut: '', date_fin: '' };

  private searchTimeout: any;

  constructor(
    private apiService: ApiService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadProduits();
  }

  onSearchChange(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => this.loadProduits(), 400);
  }

  onFilterChange(): void {
    this.loadProduits();
  }

  toggleSort(field: string): void {
  if (this.sortBy === field) {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
  } else {
    this.sortBy = field;
    this.sortOrder = 'asc';
  }
  this.loadProduits();
}

  getSortIcon(field: string): string {
    if (this.sortBy !== field) return 'unfold_more';
    return this.sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }

  resetFilters(): void {
    this.searchText = '';
    this.filterType = '';
    this.filterStatut = '';
    this.filterPrixMin = null;
    this.filterPrixMax = null;
    this.sortBy = '';
    this.sortOrder = 'asc';
    this.loadProduits();
  }

  loadProduits(): void {
    this.isLoading = true;
    const params: any = {};
    if (this.searchText) params.search = this.searchText;
    if (this.filterType) params.type = this.filterType;
    if (this.filterStatut !== '') params.statut = this.filterStatut;
    if (this.filterPrixMin !== null && this.filterPrixMin >= 0) params.prixMin = this.filterPrixMin;
    if (this.filterPrixMax !== null && this.filterPrixMax > 0) params.prixMax = this.filterPrixMax;
    if (this.sortBy) {
      params.sortBy = this.sortBy;
      params.sortOrder = this.sortOrder;
    }

    this.apiService.getListeProduits(params).subscribe({
      next: (res) => {
        if (res.success) {
          this.produits = res.produits;
          this.totalCount = res.count;
        }
        this.loadStocks();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Erreur lors du chargement des produits';
      }
    });
  }

  loadStocks(): void {
    this.apiService.getStocks().subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.stockMap.clear();
          for (const s of res.stocks) {
            this.stockMap.set(s.id_produit._id, s.quantite);
          }
        }
        this.loadAllPromotions();
      },
      error: () => {
        this.isLoading = false;
        this.loadAllPromotions();
      }
    });
  }

  getStock(produitId: string): number {
    return this.stockMap.get(produitId) ?? 0;
  }

  getStockClass(produitId: string): string {
    const q = this.getStock(produitId);
    if (q === 0) return 'bg-red-100 text-red-700';
    if (q <= 5) return 'bg-orange-100 text-orange-700';
    return 'bg-green-100 text-green-700';
  }

  getStatutLabel(statut: number): string {
    return statut === 1 ? 'Activé' : 'Désactivé';
  }

  getStatutClass(statut: number): string {
    return statut === 1
      ? 'bg-green-100 text-green-700'
      : 'bg-red-100 text-red-700';
  }

  openEdit(p: Produit): void {
    this.editProduit = { ...p };
    this.editPhotoPreview = p.photo || null;
    this.showEditModal = true;
  }

  closeEdit(): void {
    this.showEditModal = false;
    this.editProduit = {};
    this.editPhotoPreview = null;
  }

  onEditPhotoChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.editProduit.photo = e.target.result;
        this.editPhotoPreview = e.target.result;
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  removeEditPhoto(): void {
    this.editProduit.photo = '';
    this.editPhotoPreview = null;
  }

  submitEdit(): void {
    if (!this.editProduit.nom || !this.editProduit.type || this.editProduit.prix_unitaire <= 0) {
      this.notification.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    this.editLoading = true;
    this.apiService.updateProduit(this.editProduit._id, this.editProduit).subscribe({
      next: (res) => {
        this.editLoading = false;
        if (res.success) {
          this.notification.success('Produit modifié avec succès !');
          this.closeEdit();
          this.loadProduits();
        } else {
          this.notification.error(res.message || 'Erreur lors de la modification');
        }
      },
      error: (err) => {
        this.editLoading = false;
        this.notification.error(err.error?.message || 'Erreur serveur');
      }
    });
  }

  loadAllPromotions(): void {
    this.apiService.getAllPromotions().subscribe({
      next: (res) => {
        if (res.success) {
          this.promoMap.clear();
          for (const promo of res.promotions) {
            const prodId = typeof promo.id_produit === 'object' ? promo.id_produit._id : promo.id_produit;
            if (!this.promoMap.has(prodId)) {
              this.promoMap.set(prodId, []);
            }
            this.promoMap.get(prodId)!.push(promo);
          }
        }
      },
      error: () => {}
    });
  }

  getPromos(produitId: string): Promotion[] {
    return this.promoMap.get(produitId) || [];
  }

  getActivePromoCount(produitId: string): number {
    return this.getPromos(produitId).filter(p => p.statut === 1).length;
  }

  getPromoTypeLabel(type: string): string {
    switch (type) {
      case 'POURCENTAGE': return 'Promo %';
      case 'ACHETE_OFFERT': return '1+1 offert';
      case 'CODE_PROMO': return 'Code promo';
      default: return type;
    }
  }

  getPromoTypeBadgeClass(type: string): string {
    switch (type) {
      case 'POURCENTAGE': return 'bg-purple-100 text-purple-700';
      case 'ACHETE_OFFERT': return 'bg-green-100 text-green-700';
      case 'CODE_PROMO': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  isPromoExpired(promo: Promotion): boolean {
    return new Date(promo.date_fin) < new Date();
  }

  isPromoNotStarted(promo: Promotion): boolean {
    return new Date(promo.date_debut) > new Date();
  }

  openPromoModal(p: Produit): void {
    this.promoProduit = p;
    this.produitPromos = this.getPromos(p._id);
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    this.newPromo = { type_promotion: 'POURCENTAGE', pourcentage: 0, code_promo: '', date_debut: today, date_fin: nextMonth.toISOString().split('T')[0] };
    this.showPromoModal = true;
    this.loadProduitPromos(p._id);
  }

  closePromoModal(): void {
    this.showPromoModal = false;
    this.promoProduit = null;
    this.produitPromos = [];
  }

  loadProduitPromos(produitId: string): void {
    this.promoLoading = true;
    this.apiService.getPromotionsByProduit(produitId).subscribe({
      next: (res) => {
        this.promoLoading = false;
        if (res.success) {
          this.produitPromos = res.promotions;
        }
      },
      error: () => {
        this.promoLoading = false;
      }
    });
  }

addPromotion(): void {
    if (!this.promoProduit) return;

    if (!this.newPromo.date_debut || !this.newPromo.date_fin) {
        this.notification.error('Les dates de début et de fin sont obligatoires');
        return;
    }
    
    const dateDebut = new Date(this.newPromo.date_debut);
    const dateFin = new Date(this.newPromo.date_fin);
    
    if (dateFin < dateDebut) {
        this.notification.error('La date de fin ne peut pas être antérieure à la date de début');
        return;
    }
    
    if (this.newPromo.type_promotion === 'POURCENTAGE' && (!this.newPromo.pourcentage || this.newPromo.pourcentage <= 0)) {
        this.notification.error('Le pourcentage est obligatoire');
        return;
    }
    if (this.newPromo.type_promotion === 'CODE_PROMO') {
        if (!this.newPromo.code_promo || this.newPromo.code_promo.trim() === '') {
            this.notification.error('Le code promo est obligatoire');
            return;
        }
        if (!this.newPromo.pourcentage || this.newPromo.pourcentage <= 0) {
            this.notification.error('Le pourcentage est obligatoire');
            return;
        }
    }

    this.promoLoading = true;
    const data = {
        id_produit: this.promoProduit._id,
        type_promotion: this.newPromo.type_promotion,
        pourcentage: this.newPromo.type_promotion === 'ACHETE_OFFERT' ? 0 : this.newPromo.pourcentage,
        code_promo: this.newPromo.type_promotion === 'CODE_PROMO' ? this.newPromo.code_promo : '',
        date_debut: this.newPromo.date_debut,
        date_fin: this.newPromo.date_fin
    };

    this.apiService.addPromotion(data).subscribe({
        next: (res) => {
            this.promoLoading = false;
            if (res.success) {
                this.notification.success('Promotion ajoutée !');
                const today = new Date().toISOString().split('T')[0];
                const nm = new Date(); 
                nm.setMonth(nm.getMonth() + 1);
                this.newPromo = { 
                    type_promotion: 'POURCENTAGE', 
                    pourcentage: 0, 
                    code_promo: '', 
                    date_debut: today, 
                    date_fin: nm.toISOString().split('T')[0] 
                };
                this.loadProduitPromos(this.promoProduit!._id);
                this.loadAllPromotions();
            } else {
                this.notification.error(res.message || 'Erreur');
            }
        },
        error: (err) => {
            this.promoLoading = false;
            this.notification.error(err.error?.message || 'Erreur serveur');
        }
    });
}

  togglePromoStatut(promo: Promotion): void {
    const newStatut = promo.statut === 1 ? 0 : 1;
    this.apiService.updatePromotion(promo._id, { statut: newStatut }).subscribe({
      next: (res) => {
        if (res.success) {
          promo.statut = newStatut;
          this.loadAllPromotions();
        }
      },
      error: () => {}
    });
  }

  deletePromotion(promo: Promotion): void {
    if (!confirm('Supprimer cette promotion ?')) return;

    this.apiService.deletePromotion(promo._id).subscribe({
      next: (res) => {
        if (res.success) {
          this.notification.success('Promotion supprimée');
          if (this.promoProduit) {
            this.loadProduitPromos(this.promoProduit._id);
          }
          this.loadAllPromotions();
        }
      },
      error: (err) => {
        this.notification.error(err.error?.message || 'Erreur serveur');
      }
    });
  }
  sortByDate(): void {
  this.toggleSort('createdAt');
}
}
