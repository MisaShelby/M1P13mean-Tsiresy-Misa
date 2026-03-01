import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-detail-boutique-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule],
  templateUrl: './detail-boutique-dialog.html',
})
export class DetailBoutiqueDialog implements OnInit {
  boutique: any = null;
  loading = true;
  error = '';

  constructor(
    public dialogRef: MatDialogRef<DetailBoutiqueDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { boutiqueId: string },
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.chargerDetail();
  }

  chargerDetail(): void {
    this.loading = true;
    this.apiService.getBoutiqueDetailClient(this.data.boutiqueId).subscribe({
      next: (res: any) => {
        this.boutique = res.boutique;
        this.loading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.error = 'Erreur lors du chargement des détails';
        this.loading = false;
      }
    });
  }

  fermer(): void {
    this.dialogRef.close();
  }

  getPrixPromo(produit: any): number | null {
    if (!produit.promotions || produit.promotions.length === 0) return null;
    const promo = produit.promotions[0];
    if (promo.type_promotion === 'POURCENTAGE' && promo.pourcentage > 0) {
      return produit.prix_unitaire * (1 - promo.pourcentage / 100);
    }
    return null;
  }
}
