import { Component, OnInit } from '@angular/core';

import { ApiService } from '../../../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../services/notification.service';
import { RouterLink } from '@angular/router';

interface Boutique {
    _id: string;
    nom_boutique: string;
    photo?: string;
    email: string;
    nom_gerant: string;
    telephone_gerant: string;
    statut_demande: number;
    createdAt: string;
}

interface ConfirmationDialog {
    show: boolean;
    type: 'valider' | 'refuser' | null;
    boutiqueId: string;
    boutiqueNom: string;
}

@Component({
    selector: 'app-validation-inscri-boutique',
    standalone: true,
    imports: [RouterLink, FormsModule, CommonModule],
    templateUrl: './validation-inscri-boutique.html',
})
export class ValidationInscriBoutique implements OnInit {

    boutiquesEnAttente: Boutique[] = [];
    isLoading = true;
    errorMessage: string = '';
    selectedBoutique: Boutique | null = null;

    confirmationDialog: ConfirmationDialog = {
        show: false,
        type: null,
        boutiqueId: '',
        boutiqueNom: ''
    };

    constructor(
        private apiService: ApiService,
        private notification: NotificationService
    ) { }

    ngOnInit() {
        this.chargerBoutiquesEnAttente();
    }

    chargerBoutiquesEnAttente() {
        this.isLoading = true;
        this.errorMessage = '';

        this.apiService.getBoutiquesEnAttente()
            .subscribe({
                next: (response) => {
                    if (response.success) {
                        this.boutiquesEnAttente = response.boutiques;
                    } else {
                        this.errorMessage = response.message || 'Erreur lors du chargement';
                    }
                    this.isLoading = false;
                },
                error: () => {
                    this.errorMessage = 'Erreur de connexion au serveur';
                    this.isLoading = false;
                    this.notification.error('Impossible de charger les boutiques en attente', 'Erreur');
                }
            });
    }

    voirDetails(boutique: Boutique) {
        this.selectedBoutique = boutique;
    }

    closeModal() {
        this.selectedBoutique = null;
    }

    ouvrirConfirmationValider(boutique: Boutique) {
        this.confirmationDialog = {
            show: true,
            type: 'valider',
            boutiqueId: boutique._id,
            boutiqueNom: boutique.nom_boutique
        };
    }

    ouvrirConfirmationRefuser(boutique: Boutique) {
        this.confirmationDialog = {
            show: true,
            type: 'refuser',
            boutiqueId: boutique._id,
            boutiqueNom: boutique.nom_boutique
        };
    }

    fermerConfirmation() {
        this.confirmationDialog = {
            show: false,
            type: null,
            boutiqueId: '',
            boutiqueNom: ''
        };
    }

    confirmerAction() {
        if (this.confirmationDialog.type === 'valider') {
            this.validerBoutique(this.confirmationDialog.boutiqueId);
        } else if (this.confirmationDialog.type === 'refuser') {
            this.refuserBoutique(this.confirmationDialog.boutiqueId);
        }
        this.fermerConfirmation();
    }

    validerBoutique(id: string) {
        this.apiService.validerBoutique(id)
            .subscribe({
                next: (response: any) => {
                    if (response.success) {
                        this.notification.success('Boutique validée avec succès', 'Succès');
                        this.chargerBoutiquesEnAttente();
                        this.closeModal();
                    } else {
                        this.notification.error(response.message || 'Erreur lors de la validation', 'Erreur');
                    }
                },
                error: () => {
                    this.notification.error('Erreur lors de la validation', 'Erreur');
                }
            });
    }

    refuserBoutique(id: string) {
        this.apiService.refuserBoutique(id)
            .subscribe({
                next: (response: any) => {
                    if (response.success) {
                        this.notification.success('Demande refusée', 'Succès');
                        this.chargerBoutiquesEnAttente();
                        this.closeModal();
                    } else {
                        this.notification.error(response.message || 'Erreur lors du refus', 'Erreur');
                    }
                },
                error: () => {
                    this.notification.error('Erreur lors du refus', 'Erreur');
                }
            });
    }
}