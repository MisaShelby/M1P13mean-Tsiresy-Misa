import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ApiService } from '../../../services/api.service';
import { NotificationService } from '../../../services/notification.service';
import { DetailBoutiqueDialog } from '../detail-boutique-dialog/detail-boutique-dialog';

@Component({
  selector: 'app-liste-boutique-client',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatDialogModule],
  templateUrl: './liste-boutique-client.html',
})
export class ListeBoutiqueClient implements OnInit {
  boutiques: any[] = [];
  filteredBoutiques: any[] = [];
  loading = false;
  searchText = '';

  constructor(
    private apiService: ApiService,
    private notification: NotificationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.chargerBoutiques();
  }

  chargerBoutiques(): void {
    this.loading = true;
    this.apiService.getBoutiquesClient().subscribe({
      next: (res: any) => {
        this.boutiques = res.boutiques || [];
        this.filteredBoutiques = [...this.boutiques];
        this.loading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.notification.error('Erreur lors du chargement des boutiques');
        this.loading = false;
      }
    });
  }

  filtrerBoutiques(): void {
    if (!this.searchText.trim()) {
      this.filteredBoutiques = [...this.boutiques];
      return;
    }
    const search = this.searchText.toLowerCase();
    this.filteredBoutiques = this.boutiques.filter(b =>
      b.nom_boutique.toLowerCase().includes(search) ||
      b.nom_gerant.toLowerCase().includes(search)
    );
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
}

