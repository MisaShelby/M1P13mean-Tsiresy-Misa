import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { UIChart } from 'primeng/chart';
import { ApiService } from '../../../services/api.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-stat-admin',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterModule, UIChart],
  templateUrl: './stat-admin.html',
})
export class StatAdmin implements OnInit {
  loading = false;
  stats: any = null;

  // Chart data
  statutBoutiquesData: any;
  statutBoutiquesOptions: any;

  commandesStatutData: any;
  commandesStatutOptions: any;

  produitsTypeData: any;
  produitsTypeOptions: any;

  commandesMoisData: any;
  commandesMoisOptions: any;

  caMoisData: any;
  caMoisOptions: any;

  topProduitsData: any;
  topProduitsOptions: any;

  topCAData: any;
  topCAOptions: any;

  topCommandesData: any;
  topCommandesOptions: any;

  abonnementsData: any;
  abonnementsOptions: any;

  constructor(
    private apiService: ApiService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.chargerStatistiques();
  }

  chargerStatistiques(): void {
    this.loading = true;
    this.apiService.getStatistiquesAdmin().subscribe({
      next: (res: any) => {
        this.stats = res.statistiques;
        this.buildCharts();
        this.loading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.notification.error('Erreur lors du chargement des statistiques');
        this.loading = false;
      }
    });
  }

  buildCharts(): void {
    const s = this.stats;

    // --- Statut Boutiques (Doughnut) ---
    this.statutBoutiquesData = {
      labels: ['Actives', 'En attente', 'Refusées', 'Désactivées'],
      datasets: [{
        data: [
          s.statut_boutiques.validees,
          s.statut_boutiques.en_attente,
          s.statut_boutiques.refusees,
          s.statut_boutiques.desactivees
        ],
        backgroundColor: ['#22c55e', '#eab308', '#ef4444', '#9ca3af'],
        hoverBackgroundColor: ['#16a34a', '#ca8a04', '#dc2626', '#6b7280']
      }]
    };
    this.statutBoutiquesOptions = {
      plugins: { legend: { position: 'bottom' } },
      cutout: '50%'
    };

    // --- Commandes par Statut (Pie) ---
    this.commandesStatutData = {
      labels: ['En préparation', 'Expédié', 'Livré'],
      datasets: [{
        data: [
          s.commandes_par_statut.en_cours,
          s.commandes_par_statut.expedie,
          s.commandes_par_statut.livre
        ],
        backgroundColor: ['#f59e0b', '#3b82f6', '#22c55e'],
        hoverBackgroundColor: ['#d97706', '#2563eb', '#16a34a']
      }]
    };
    this.commandesStatutOptions = {
      plugins: { legend: { position: 'bottom' } }
    };

    // --- Produits par Type (Polar Area) ---
    const typeLabels = Object.keys(s.produits_par_type);
    const typeValues = Object.values(s.produits_par_type);
    this.produitsTypeData = {
      labels: typeLabels,
      datasets: [{
        data: typeValues,
        backgroundColor: ['#ef4444', '#3b82f6', '#a855f7', '#f59e0b', '#06b6d4'],
        borderColor: '#fff',
        borderWidth: 2
      }]
    };
    this.produitsTypeOptions = {
      plugins: { legend: { position: 'bottom' } }
    };

    // --- Commandes par Mois (Line) ---
    this.commandesMoisData = {
      labels: s.commandes_par_mois.map((m: any) => m.mois),
      datasets: [{
        label: 'Nombre de commandes',
        data: s.commandes_par_mois.map((m: any) => m.nombre_commandes),
        fill: true,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
        pointBackgroundColor: '#6366f1',
        pointRadius: 4
      }]
    };
    this.commandesMoisOptions = {
      plugins: { legend: { display: true } },
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1 } }
      }
    };

    // --- CA par Mois (Bar) ---
    this.caMoisData = {
      labels: s.commandes_par_mois.map((m: any) => m.mois),
      datasets: [{
        label: 'Chiffre d\'affaires (Ar)',
        data: s.commandes_par_mois.map((m: any) => m.chiffre_affaires),
        backgroundColor: 'rgba(34, 197, 94, 0.6)',
        borderColor: '#22c55e',
        borderWidth: 1,
        borderRadius: 6
      }]
    };
    this.caMoisOptions = {
      plugins: { legend: { display: true } },
      scales: {
        y: { beginAtZero: true }
      }
    };

    // --- Top 10 Boutiques par Produits (Horizontal Bar) ---
    this.topProduitsData = {
      labels: s.top10_boutiques_produits.map((b: any) => b.nom),
      datasets: [{
        label: 'Nombre de produits',
        data: s.top10_boutiques_produits.map((b: any) => b.nombre_produits),
        backgroundColor: 'rgba(99, 102, 241, 0.7)',
        borderColor: '#6366f1',
        borderWidth: 1,
        borderRadius: 4
      }]
    };
    this.topProduitsOptions = {
      indexAxis: 'y',
      plugins: { legend: { display: false } },
      scales: {
        x: { beginAtZero: true, ticks: { stepSize: 1 } }
      }
    };

    // --- Top 10 Boutiques par CA (Horizontal Bar) ---
    this.topCAData = {
      labels: s.top10_boutiques_ca.map((b: any) => b.nom),
      datasets: [{
        label: 'Chiffre d\'affaires (Ar)',
        data: s.top10_boutiques_ca.map((b: any) => b.chiffre_affaires),
        backgroundColor: 'rgba(34, 197, 94, 0.7)',
        borderColor: '#22c55e',
        borderWidth: 1,
        borderRadius: 4
      }]
    };
    this.topCAOptions = {
      indexAxis: 'y',
      plugins: { legend: { display: false } },
      scales: {
        x: { beginAtZero: true }
      }
    };

    // --- Top 10 Boutiques par Commandes (Horizontal Bar) ---
    this.topCommandesData = {
      labels: s.top10_boutiques_commandes.map((b: any) => b.nom),
      datasets: [{
        label: 'Nombre de commandes',
        data: s.top10_boutiques_commandes.map((b: any) => b.nombre_commandes),
        backgroundColor: 'rgba(245, 158, 11, 0.7)',
        borderColor: '#f59e0b',
        borderWidth: 1,
        borderRadius: 4
      }]
    };
    this.topCommandesOptions = {
      indexAxis: 'y',
      plugins: { legend: { display: false } },
      scales: {
        x: { beginAtZero: true, ticks: { stepSize: 1 } }
      }
    };

    // --- Abonnements par Plan (Doughnut) ---
    this.abonnementsData = {
      labels: s.abonnements_par_plan.map((a: any) => `${a.plan} (${a.tarif} Ar)`),
      datasets: [{
        data: s.abonnements_par_plan.map((a: any) => a.nombre),
        backgroundColor: ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#a855f7'],
        hoverBackgroundColor: ['#4f46e5', '#16a34a', '#d97706', '#dc2626', '#0891b2', '#9333ea']
      }]
    };
    this.abonnementsOptions = {
      plugins: { legend: { position: 'bottom' } },
      cutout: '50%'
    };
  }

  formatMontant(montant: number): string {
    return (montant || 0).toLocaleString('fr-FR') + ' Ar';
  }
}
