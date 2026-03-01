import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
    selector: 'app-create-produit',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './create-produit.html',
})
export class CreateProduit {
    produit = {
        nom: '',
        photo: '',
        description: '',
        prix_unitaire: 0,
        type: '',
        statut: 1
    };

    types: string[] = ['Aliment', 'Électronique', 'Cosmétique', 'Mobilier', 'Informatique'];
    isLoading = false;
    photoPreview: string | null = null;

    // Promotions
    ajouterPromo = false;
    promotions: any[] = [];

    constructor(
        private apiService: ApiService,
        private router: Router,
        private notification: NotificationService
    ) {}

    onPhotoChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
            this.produit.photo = e.target.result;
            this.photoPreview = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
        }
    }

    removePhoto(): void {
        this.produit.photo = '';
        this.photoPreview = null;
    }

    addPromotionRow(): void {
        const today = new Date();
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        this.promotions.push({
            type_promotion: 'POURCENTAGE',
            pourcentage: 0,
            code_promo: '',
            date_debut: today.toISOString().split('T')[0],
            date_fin: nextMonth.toISOString().split('T')[0]
        });
    }

    removePromotionRow(index: number): void {
        this.promotions.splice(index, 1);
    }

    getPromoLabel(type: string): string {
        switch (type) {
            case 'POURCENTAGE': return 'Promotion %';
            case 'ACHETE_OFFERT': return '1 acheté = 1 offert';
            case 'CODE_PROMO': return 'Code promo';
            default: return type;
        }
    }

    onSubmit(): void {
        if (!this.produit.nom || !this.produit.type || this.produit.prix_unitaire <= 0) {
            this.notification.error('Veuillez remplir tous les champs obligatoires');
            return;
        }

        if (this.ajouterPromo && this.promotions.length > 0) {
            for (const promo of this.promotions) {
                if (!promo.date_debut || !promo.date_fin) {
                    this.notification.error('Les dates de début et de fin sont obligatoires');
                    return;
                }
                
                const dateDebut = new Date(promo.date_debut);
                const dateFin = new Date(promo.date_fin);
                
                if (dateFin < dateDebut) {
                    this.notification.error('La date de fin ne peut pas être antérieure à la date de début');
                    return;
                }
                
                if (promo.type_promotion === 'POURCENTAGE' && (!promo.pourcentage || promo.pourcentage <= 0 || promo.pourcentage > 100)) {
                    this.notification.error('Le pourcentage de promotion doit être entre 1 et 100');
                    return;
                }
                if (promo.type_promotion === 'CODE_PROMO') {
                    if (!promo.code_promo || promo.code_promo.trim() === '') {
                        this.notification.error('Le code promo est obligatoire');
                        return;
                    }
                    if (!promo.pourcentage || promo.pourcentage <= 0 || promo.pourcentage > 100) {
                        this.notification.error('Le pourcentage du code promo doit être entre 1 et 100');
                        return;
                    }
                }
            }
        }

        this.isLoading = true;
        this.apiService.createProduit(this.produit).subscribe({
            next: (res) => {
                if (res.success) {
                    const produitId = res.produit?._id;
                    if (this.ajouterPromo && this.promotions.length > 0 && produitId) {
                        this.savePromotions(produitId);
                    } else {
                        this.isLoading = false;
                        this.notification.success('Produit créé avec succès !');
                        this.router.navigate(['/liste-produit']);
                    }
                } else {
                    this.isLoading = false;
                    this.notification.error(res.message || 'Erreur lors de la création');
                }
            },
            error: (err) => {
                this.isLoading = false;
                this.notification.error(err.error?.message || 'Erreur serveur');
            }
        });
    }

    savePromotions(produitId: string): void {
        let completed = 0;
        let hasError = false;
        const total = this.promotions.length;

        for (const promo of this.promotions) {
            const data = {
                id_produit: produitId,
                type_promotion: promo.type_promotion,
                pourcentage: promo.type_promotion === 'ACHETE_OFFERT' ? 0 : promo.pourcentage,
                code_promo: promo.type_promotion === 'CODE_PROMO' ? promo.code_promo : '',
                date_debut: promo.date_debut,
                date_fin: promo.date_fin
            };

            this.apiService.addPromotion(data).subscribe({
                next: () => {
                    completed++;
                    if (completed === total) {
                        this.isLoading = false;
                        if (!hasError) {
                            this.notification.success('Produit et promotions créés avec succès !');
                        }
                        this.router.navigate(['/liste-produit']);
                    }
                },
                error: (err) => {
                    completed++;
                    hasError = true;
                    this.notification.error(err.error?.message || 'Erreur lors de la création d\'une promotion');
                    if (completed === total) {
                        this.isLoading = false;
                        this.router.navigate(['/liste-produit']);
                    }
                }
            });
        }
    }

    goToListeProduit(): void {
        this.router.navigate(['/liste-produit']);
    }

}
