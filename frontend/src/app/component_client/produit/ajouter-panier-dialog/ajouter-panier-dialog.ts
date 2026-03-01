import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../../services/api.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-ajouter-panier-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule],
  templateUrl: './ajouter-panier-dialog.html',
})
export class AjouterPanierDialog implements OnInit {
  paniersActifs: any[] = [];
  loading = false;
  submitting = false;

  // Mode: 'select' pour choisir un panier existant, 'create' pour en créer un nouveau
  mode: 'select' | 'create' = 'select';

  // Pour la création d'un nouveau panier
  nouveauNomPanier = '';

  // Panier sélectionné
  panierSelectionne: string = '';

  // Quantité du produit
  quantite = 1;

  constructor(
    public dialogRef: MatDialogRef<AjouterPanierDialog>,
    @Inject(MAT_DIALOG_DATA) public data: {
      produit: any;
    },
    private apiService: ApiService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.chargerPaniersActifs();
  }

  chargerPaniersActifs(): void {
    this.loading = true;
    this.apiService.getPaniersActifs().subscribe({
      next: (res: any) => {
        this.paniersActifs = res.paniers || [];
        // Si aucun panier actif, basculer en mode création
        if (this.paniersActifs.length === 0) {
          this.mode = 'create';
        }
        this.loading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  ajouterAuPanierExistant(): void {
    if (!this.panierSelectionne) {
      this.notification.warning('Veuillez sélectionner un panier');
      return;
    }

    this.submitting = true;
    const produit = this.data.produit;
    const prixEffectif = this.getPrixEffectif(produit);

    this.apiService.ajouterProduitAuPanier({
      id_panier: this.panierSelectionne,
      id_produit: produit._id,
      quantite: this.quantite,
      prix_unitaire: prixEffectif,
      id_boutique: produit.boutique_info?._id || produit.boutique
    }).subscribe({
      next: (res: any) => {
        this.notification.success('Produit ajouté au panier !');
        this.submitting = false;
        this.dialogRef.close(true);
      },
      error: (err: any) => {
        console.error(err);
        this.notification.error('Erreur lors de l\'ajout au panier');
        this.submitting = false;
      }
    });
  }

  creerEtAjouter(): void {
    if (!this.nouveauNomPanier.trim()) {
      this.notification.warning('Veuillez saisir un nom pour le panier');
      return;
    }

    this.submitting = true;
    const produit = this.data.produit;
    const prixEffectif = this.getPrixEffectif(produit);

    this.apiService.creerPanierAvecProduit({
      nom: this.nouveauNomPanier.trim(),
      id_produit: produit._id,
      quantite: this.quantite,
      prix_unitaire: prixEffectif,
      id_boutique: produit.boutique_info?._id || produit.boutique
    }).subscribe({
      next: (res: any) => {
        this.notification.success('Nouveau panier créé et produit ajouté !');
        this.submitting = false;
        this.dialogRef.close(true);
      },
      error: (err: any) => {
        console.error(err);
        this.notification.error('Erreur lors de la création du panier');
        this.submitting = false;
      }
    });
  }

  getPrixEffectif(produit: any): number {
    if (produit.promotions && produit.promotions.length > 0) {
      const promo = produit.promotions[0];
      if (promo.type_promotion === 'POURCENTAGE' && promo.pourcentage > 0) {
        return produit.prix_unitaire * (1 - promo.pourcentage / 100);
      }
    }
    return produit.prix_unitaire;
  }

  fermer(): void {
    this.dialogRef.close(false);
  }
}
