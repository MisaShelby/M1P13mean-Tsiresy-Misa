import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, RegisterData } from '../auth.service';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../services/notification.service';

@Component({
    selector: 'app-inscription',
    imports: [RouterLink, FormsModule, CommonModule],
    templateUrl: './inscription.html',
})
export class Inscription {
    userData: RegisterData = {
        nom_complet: '',
        email: '',
        telephone: '',
        mdp: '',
        confirmPassword: ''
    };

    isLoading = false;
    fieldErrors: { [key: string]: string } = {};

    constructor(
        private authService: AuthService,
        private router: Router,
        private notification: NotificationService
    ) { }

    onSubmit() {
        if (this.userData.mdp !== this.userData.confirmPassword) {
            this.notification.error('Les mots de passe ne correspondent pas');
            this.fieldErrors['confirmPassword'] = 'Les mots de passe ne correspondent pas';
            return;
        }

        this.isLoading = true;
        this.fieldErrors = {};

        this.authService.register(this.userData).subscribe({
            next: (response) => {
                if (response.success) {
                    this.notification.success(
                        'Inscription réussie ! Redirection vers la connexion...',
                        'Bienvenue'
                    );

                    setTimeout(() => this.router.navigate(['/login']), 2000);
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
}