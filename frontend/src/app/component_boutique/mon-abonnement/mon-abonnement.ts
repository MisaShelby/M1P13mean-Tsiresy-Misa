import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthBoutiqueService } from '../../auth/boutique/auth_boutique.service';
import { PorteFeuilleBoutique } from '../porte-feuille-boutique/porte-feuille-boutique';

export interface Paiement {
    _id: string;
    tarif: number;
    date_paiement: string;
}

export interface CommissionType {
    _id: string;
    nom: string;
    tarif: number;
    description?: string;
}

export interface Abonnement {
    _id: string;
    statut: 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
    date_debut: string;
    prochain_paiement: string;
    id_commission_type: {
        _id: string;
        nom: string;
        tarif: number;
        description?: string;
    };
}

@Component({
    selector: 'app-mon-abonnement',
    standalone: true,
    imports: [CommonModule, DatePipe, PorteFeuilleBoutique],
    templateUrl: './mon-abonnement.html',
})
export class MonAbonnementComponent implements OnInit {
    isLoading = true;
    boutique: any = null;
    abonnement: Abonnement | null = null;
    paiements: Paiement[] = [];
    commissionTypes: CommissionType[] = [];
    changingPlan = false;
    changeError: string | null = null;
    changeSuccess: string | null = null;
    selectedPlanId: string | null = null;
    showChangePlanSection = false;
    showPortefeuille = false;
    private apiUrl = 'http://mean-local.wip:8888/auth';

    constructor(
        private http: HttpClient,
        private authService: AuthBoutiqueService
    ) { }

    ngOnInit(): void {
        this.loadAbonnement();
        this.loadCommissionTypes();
    }

    private getHeaders() {
        return { Authorization: `Bearer ${this.authService.getToken()}` };
    }

    loadAbonnement(): void {
        this.http.get<any>(`${this.apiUrl}/mon-abonnement`, { headers: this.getHeaders() }).subscribe({
            next: (res) => {
                if (res.success) {
                    this.boutique = res.boutique;
                    this.abonnement = res.abonnement;
                    this.paiements = res.paiements;
                    if (res.boutique) {
                        localStorage.setItem('boutique', JSON.stringify(res.boutique));
                    }
                }
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
            }
        });
    }

    loadCommissionTypes(): void {
        this.http.get<CommissionType[]>(`${this.apiUrl}/commissionType`).subscribe({
            next: (types) => {
                this.commissionTypes = types;
            },
            error: () => {
                this.commissionTypes = [];
            }
        });
    }

    toggleChangePlan(): void {
        this.showChangePlanSection = !this.showChangePlanSection;
        this.changeError = null;
        this.changeSuccess = null;
        this.selectedPlanId = null;
    }

    selectPlan(planId: string): void {
        if (this.abonnement && this.abonnement.id_commission_type._id === planId) {
            return; 
        }
        this.selectedPlanId = planId;
        this.changeError = null;
        this.changeSuccess = null;
    }

    isCurrentPlan(planId: string): boolean {
        return !!(this.abonnement && this.abonnement.id_commission_type._id === planId);
    }

    confirmerChangement(): void {
        if (!this.selectedPlanId || this.changingPlan) return;

        const selectedType = this.commissionTypes.find(c => c._id === this.selectedPlanId);
        if (!selectedType) return;

        this.changingPlan = true;
        this.changeError = null;
        this.changeSuccess = null;

        this.http.put<any>(`${this.apiUrl}/changer-abonnement`, {
            commission_type_id: this.selectedPlanId
        }, { headers: this.getHeaders() }).subscribe({
            next: (res) => {
                if (res.success) {
                    this.abonnement = res.abonnement;
                    this.boutique = res.boutique;
                    this.paiements = res.paiements;
                    this.changeSuccess = res.message;
                    this.selectedPlanId = null;
                    this.showChangePlanSection = false;
                    if (res.boutique) {
                        localStorage.setItem('boutique', JSON.stringify(res.boutique));
                    }
                    this.loadAbonnement();
                }
                this.changingPlan = false;
            },
            error: (err) => {
                this.changeError = err.error?.message || 'Erreur lors du changement d\'abonnement';
                this.changingPlan = false;
            }
        });
    }

    getSelectedPlanNom(): string {
        const plan = this.commissionTypes.find(c => c._id === this.selectedPlanId);
        return plan ? plan.nom : '';
    }

    getSelectedPlanTarif(): number {
        const plan = this.commissionTypes.find(c => c._id === this.selectedPlanId);
        return plan ? plan.tarif : 0;
    }

    onRechargeEffectuee(nouveauSolde: number): void {
        if (this.boutique) {
            this.boutique.portefeuille = nouveauSolde;
        }
    }

    joursRestants(): number {
        if (!this.abonnement) return 0;
        const diff = new Date(this.abonnement.prochain_paiement).getTime() - Date.now();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }
    togglePortefeuille(): void {
        this.showPortefeuille = !this.showPortefeuille;
    }
}
