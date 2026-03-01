import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { NotificationService } from '../../../services/notification.service';
import { DetailBoutiqueDialog } from '../detail-boutique-dialog/detail-boutique-dialog';
import { AjouterPanierDialog } from '../ajouter-panier-dialog/ajouter-panier-dialog';

@Component({
  selector: 'app-liste-produit-client',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatDialogModule],
  templateUrl: './liste-produit-client.html',
})
export class ListeProduitClient implements OnInit {
  produits: any[] = [];
  loading = false;

  searchText = '';
  selectedType = '';
  prixMin: number | null = null;
  prixMax: number | null = null;
  sortBy = 'commission';
  sortOrder = 'desc';
filtresOuverts: boolean = true;
  types = ['Aliment', 'Électronique', 'Cosmétique', 'Mobilier', 'Informatique'];

  constructor(
    private apiService: ApiService,
    private notification: NotificationService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.chargerProduits();
  }

  toggleFiltres(): void {
      this.filtresOuverts = !this.filtresOuverts;
  }
  chargerProduits(): void {
    this.loading = true;
    const params: any = {};

    if (this.searchText) params.search = this.searchText;
    if (this.selectedType) params.type = this.selectedType;
    if (this.prixMin !== null && this.prixMin !== undefined) params.prixMin = this.prixMin;
    if (this.prixMax !== null && this.prixMax !== undefined) params.prixMax = this.prixMax;
    if (this.sortBy) params.sortBy = this.sortBy;
    if (this.sortOrder) params.sortOrder = this.sortOrder;

    this.apiService.getProduitsClient(params).subscribe({
      next: (res: any) => {
        this.produits = res.produits || [];
        this.loading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.notification.error('Erreur lors du chargement des produits');
        this.loading = false;
      }
    });
  }

  resetFiltres(): void {
    this.searchText = '';
    this.selectedType = '';
    this.prixMin = null;
    this.prixMax = null;
    this.sortBy = 'commission';
    this.sortOrder = 'desc';
    this.chargerProduits();
  }

  getPrixPromo(produit: any): number | null {
    if (!produit.promotions || produit.promotions.length === 0) return null;
    const promo = produit.promotions[0];
    if (promo.type_promotion === 'POURCENTAGE' && promo.pourcentage > 0) {
      return produit.prix_unitaire * (1 - promo.pourcentage / 100);
    }
    return null;
  }

  getCommissionBadgeClass(tarif: number): string {
    if (tarif === 0) return 'bg-gray-100 text-gray-600';
    if (tarif <= 5) return 'bg-blue-100 text-blue-700';
    if (tarif <= 15) return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  }

  ouvrirDetailBoutique(boutiqueId: string): void {
    this.dialog.open(DetailBoutiqueDialog, {
      width: '700px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      panelClass: 'boutique-detail-dialog',
      data: { boutiqueId }
    });
  }

  ouvrirAjouterPanier(produit: any): void {
    this.dialog.open(AjouterPanierDialog, {
      width: '500px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: { produit }
    });
  }

  allerAuxPaniers(): void {
    this.router.navigate(['/liste-panier']);
  }
}
