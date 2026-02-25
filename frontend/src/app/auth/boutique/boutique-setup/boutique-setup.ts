import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthBoutiqueService } from '../auth_boutique.service';
import { CommissionTypeService } from '../../admin/commission-type.service';
import { CommissionType } from '../../admin/commission-type/commission-type.component';
import { NotificationService } from '../../../services/notification.service';

@Component({
    selector: 'app-boutique-setup',
    imports: [CommonModule],
    templateUrl: './boutique-setup.html',
})
export class BoutiqueSetupComponent implements OnInit {
    commissionTypes: CommissionType[] = [];
    selectedType: CommissionType | null = null;
    isLoading = false;
    isLoadingTypes = true;
    step: 'choose' | 'confirm' = 'choose';
    portefeuille = 0;

    constructor(
        private authService: AuthBoutiqueService,
        private commissionService: CommissionTypeService,
        private router: Router,
        private notification: NotificationService
    ) {}

    ngOnInit(): void {
        // Si la boutique n'a pas besoin de setup, rediriger
        if (!this.authService.requiresSetup()) {
            this.router.navigate(['/test']);
            return;
        }
        // Récupérer le solde du portefeuille depuis le stockage local
        const boutiqueStr = localStorage.getItem('boutique');
        if (boutiqueStr) {
            try {
                const boutique = JSON.parse(boutiqueStr);
                this.portefeuille = boutique.portefeuille ?? 0;
            } catch (e) {}
        }
        this.loadCommissionTypes();
    }

    loadCommissionTypes(): void {
        this.isLoadingTypes = true;
        this.commissionService.getAllCommissionTypes().subscribe({
            next: (data) => {
                this.commissionTypes = data;
                this.isLoadingTypes = false;
            },
            error: () => {
                this.notification.error('Impossible de charger les plans. Veuillez réessayer.', 'Erreur');
                this.isLoadingTypes = false;
            }
        });
    }

    selectType(type: CommissionType): void {
        this.selectedType = type;
        this.step = 'confirm';
    }

    backToChoose(): void {
        this.selectedType = null;
        this.step = 'choose';
    }

    confirmerPaiement(): void {
        if (!this.selectedType?._id) return;

        this.isLoading = true;
        this.authService.souscriptionPremierMois(this.selectedType._id).subscribe({
            next: (response) => {
                if (response.success) {
                    // Mettre à jour la boutique en localStorage avec les données retournées
                    if (response.boutique) {
                        localStorage.setItem('boutique', JSON.stringify(response.boutique));
                        this.portefeuille = response.boutique.portefeuille ?? 0;
                    }
                    this.authService.clearSetupFlag();

                    this.notification.success(
                        `Abonnement "${this.selectedType!.nom}" activé avec succès ! Premier mois payé.`,
                        'Configuration terminée'
                    );
                    setTimeout(() => this.router.navigate(['/test']), 1500);
                } else {
                    this.notification.error(response.message || 'Erreur lors de la configuration.', 'Erreur');
                    this.isLoading = false;
                }
            },
            error: (error) => {
                if (error.status === 402 && error.error?.code === 'SOLDE_INSUFFISANT') {
                    this.notification.warning(
                        error.error.message,
                        'Solde insuffisant'
                    );
                } else {
                    this.notification.error(
                        error.error?.message || 'Erreur serveur. Veuillez réessayer.',
                        'Erreur'
                    );
                }
                this.isLoading = false;
            }
        });
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/login-boutique']);
    }
}
