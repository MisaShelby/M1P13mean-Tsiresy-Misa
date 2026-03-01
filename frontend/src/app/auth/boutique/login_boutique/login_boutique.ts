import { AuthBoutiqueService, LoginBoutiqueData } from '../auth_boutique.service';
import { Router, RouterLink } from '@angular/router';

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../services/notification.service';

@Component({
    selector: 'app-login-boutique',
    imports: [RouterLink, FormsModule, CommonModule],
    templateUrl: './login_boutique.html',
})
export class LoginBoutique {
    credentials: LoginBoutiqueData = {
        nom_boutique: '',
        mdp: ''
    };
    isLoading = false;
    fieldErrors: { [key: string]: string } = {};

    constructor(
        private authService: AuthBoutiqueService,
        private router: Router,
        private notification: NotificationService
    ) { }

    onSubmit() {
        this.isLoading = true;
        this.fieldErrors = {};

        this.authService.login(this.credentials).subscribe({
            next: (response) => {
                if (response.success) {
                    this.notification.success(
                        'Connexion réussie !',
                        'Bienvenue'
                    );

                    setTimeout(() => {
                        if (response.requires_setup) {
                            this.router.navigate(['/boutique-setup']);
                        } else {
                            this.router.navigate(['/liste-produit']);
                        }
                    }, 1500);
                } else {
                    if (response.errors) {
                        response.errors.forEach(error => {
                            this.fieldErrors[error.field] = error.message;
                        });
                    }

                    this.notification.error(
                        response.message || 'Échec de la connexion',
                        'Connexion échouée'
                    );
                }
            },
            error: (error) => {
                if (error.status === 403 && error.error?.code === 'ACCOUNT_NOT_VALIDATED') {
                    this.notification.warning(
                        error.error.message || 'Votre compte n\'a pas encore été validé par l\'administration.',
                        'Compte non validé',
                    );
                }
                else if (error.status === 401) {
                    this.notification.error(
                        'Nom du boutique ou mot de passe incorrect',
                        'Authentification échouée'
                    );
                }
                else if (error.status === 400) {
                    this.notification.warning(
                        'Veuillez vérifier les informations saisies',
                        'Données invalides'
                    );

                    if (error.error?.errors) {
                        error.error.errors.forEach((err: any) => {
                            this.fieldErrors[err.field] = err.message;
                        });
                    }
                }
                else if (error.status === 500) {
                    this.notification.error(
                        'Erreur serveur. Veuillez réessayer plus tard.',
                        'Erreur interne'
                    );
                }
                else {
                    this.notification.error(
                        error.error?.message || 'Une erreur est survenue lors de la connexion',
                        'Erreur'
                    );
                }
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