import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../../services/api.service';
import { NotificationService } from '../../../services/notification.service';
import { AuthService } from '../../../auth/client/auth.service';

@Component({
  selector: 'app-paiement-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule],
  templateUrl: './paiement-dialog.html',
})
export class PaiementDialog implements OnInit {
  submitting = false;
  modePaiement: string = '';
  adresseLivraison: string = '';

  constructor(
    public dialogRef: MatDialogRef<PaiementDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { panier: any },
    private apiService: ApiService,
    private notification: NotificationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Pré-remplir l'adresse si disponible dans le profil
    const user = this.authService.getCurrentUser();
    if (user && (user as any).adresse_livraison) {
      this.adresseLivraison = (user as any).adresse_livraison;
    }
  }

  confirmerPaiement(): void {
    if (!this.modePaiement) {
      this.notification.warning('Veuillez sélectionner un mode de paiement');
      return;
    }
    if (!this.adresseLivraison.trim()) {
      this.notification.warning('Veuillez saisir votre adresse de livraison');
      return;
    }

    this.submitting = true;

    this.apiService.creerCommande({
      id_panier: this.data.panier._id,
      paiement: this.modePaiement,
      adresse_livraison: this.adresseLivraison.trim()
    }).subscribe({
      next: (res: any) => {
        this.notification.success('Commande confirmée avec succès !');
        this.submitting = false;
        this.dialogRef.close({ success: true, commande: res.commande });
      },
      error: (err: any) => {
        console.error(err);
        this.notification.error(err.error?.message || 'Erreur lors de la confirmation de la commande');
        this.submitting = false;
      }
    });
  }

  fermer(): void {
    this.dialogRef.close(null);
  }
}
