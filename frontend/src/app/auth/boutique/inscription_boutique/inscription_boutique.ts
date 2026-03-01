import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthBoutiqueService, RegisterBoutiqueData } from '../auth_boutique.service';
import { NotificationService } from '../../../services/notification.service';
import { FileUploadModule } from 'primeng/fileupload';

@Component({
    selector: 'app-inscription-boutique',
    imports: [RouterLink, FormsModule, CommonModule, FileUploadModule],
    templateUrl: './inscription_boutique.html',
})
export class InscriptionBoutique {
    boutiqueData: RegisterBoutiqueData = {
        nom_boutique: '',
        photo: '',
        email: '',
        nom_gerant: '',
        telephone_gerant: '',
        mdp: '',
        confirmMdp: ''
    };

    isLoading = false;
    fieldErrors: { [key: string]: string } = {};

    constructor(
        private authService: AuthBoutiqueService,
        private router: Router,
        private notification: NotificationService
    ) { }

    onSubmit() {
        if (this.boutiqueData.mdp !== this.boutiqueData.confirmMdp) {
            this.notification.error('Les mots de passe ne correspondent pas');
            this.fieldErrors['confirmMdp'] = 'Les mots de passe ne correspondent pas';
            return;
        }

        this.isLoading = true;
        this.fieldErrors = {};

        this.authService.register(this.boutiqueData).subscribe({
            next: (response) => {
                if (response.success) {
                    this.notification.success(
                        'Demande d\'inscription réussie ! Redirection vers la connexion...',
                        'Bienvenue'
                    );

                    setTimeout(() => this.router.navigate(['/login-boutique']), 2000);
                } else {
                    if (response.errors) {
                        response.errors.forEach(error => {
                            this.fieldErrors[error.field] = error.message;
                        });
                        this.notification.warning('Veuillez corriger les erreurs dans le formulaire');
                    } else {
                        this.notification.error(response.message || 'Erreur lors de l\'inscription');
                    }
                }
            },
            error: (error) => {
                console.error('Erreur:', error);
                this.isLoading = false;

                const errorMessages: { [key: number]: string } = {
                    400: 'Données invalides. Vérifiez vos informations.',
                    409: 'Un compte existe déjà avec cet email ou téléphone.',
                    500: 'Erreur serveur. Veuillez réessayer plus tard.',
                };

                this.notification.error(
                    errorMessages[error.status] || 'Erreur de connexion',
                    'Erreur'
                );
            },
            complete: () => {
                this.isLoading = false;
            }
        });
    }

    hasError(field: string): boolean {
        return !!this.fieldErrors[field];
    }

    getError(field: string): string {
        return this.fieldErrors[field] || '';
    }

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (!input.files?.length) return;

        const file = input.files[0];

        const reader = new FileReader();
        reader.onload = () => {
            this.boutiqueData.photo = reader.result as string;
            this.boutiqueData.photoPreview = reader.result as string;
        };
        reader.readAsDataURL(file);
    }

}
