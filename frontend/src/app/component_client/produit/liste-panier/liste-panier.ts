import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { NotificationService } from '../../../services/notification.service';
import { PaiementDialog } from '../paiement-dialog/paiement-dialog';

@Component({
  selector: 'app-liste-panier',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatDialogModule],
  templateUrl: './liste-panier.html',
})
export class ListePanier implements OnInit {
  paniers: any[] = [];
  loading = false;

  // Paniers ouverts (pour toggle accordion)
  paniersOuverts: Set<string> = new Set();

  constructor(
    private apiService: ApiService,
    private notification: NotificationService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.chargerPaniers();
  }

  chargerPaniers(): void {
    this.loading = true;
    this.apiService.getTousPaniers().subscribe({
      next: (res: any) => {
        this.paniers = res.paniers || [];
        // Ouvrir par défaut tous les paniers
        this.paniers.forEach(p => {
          this.paniersOuverts.add(p._id);
        });
        this.loading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.notification.error('Erreur lors du chargement des paniers');
        this.loading = false;
      }
    });
  }

  togglePanier(panierId: string): void {
    if (this.paniersOuverts.has(panierId)) {
      this.paniersOuverts.delete(panierId);
    } else {
      this.paniersOuverts.add(panierId);
    }
  }

  isPanierOuvert(panierId: string): boolean {
    return this.paniersOuverts.has(panierId);
  }

  ouvrirPaiement(panier: any): void {
    if (!panier.produits || panier.produits.length === 0) {
      this.notification.warning('Le panier est vide');
      return;
    }

    const dialogRef = this.dialog.open(PaiementDialog, {
      width: '550px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: { panier }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        this.chargerPaniers();
        this.router.navigate(['/suivi-commandes']);
      }
    });
  }

  supprimerProduit(panierProduitId: string): void {
    this.apiService.supprimerProduitDuPanier(panierProduitId).subscribe({
      next: () => {
        this.notification.success('Produit supprimé du panier');
        this.chargerPaniers();
      },
      error: (err: any) => {
        console.error(err);
        this.notification.error('Erreur lors de la suppression');
      }
    });
  }

  supprimerPanier(panierId: string): void {
    this.apiService.supprimerPanier(panierId).subscribe({
      next: () => {
        this.notification.success('Panier supprimé');
        this.chargerPaniers();
      },
      error: (err: any) => {
        console.error(err);
        this.notification.error('Erreur lors de la suppression du panier');
      }
    });
  }

  retourProduits(): void {
    this.router.navigate(['/liste-produit-client']);
  }

  allerAuxCommandes(): void {
    this.router.navigate(['/suivi-commandes']);
  }

  getTotalGeneral(): number {
    return this.paniers.reduce((sum, p) => sum + (p.total || 0), 0);
  }
}
