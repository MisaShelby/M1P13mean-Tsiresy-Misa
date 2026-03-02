import { AuthService, LoginData } from '../auth.service';
import { Router, RouterLink } from '@angular/router';

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../services/notification.service';

@Component({
    selector: 'app-login',
    imports: [RouterLink, FormsModule, CommonModule],
    templateUrl: './login.html',
})
export class Login {
    readonly DEFAULT_EMAIL = 'client@gmail.com';
    readonly DEFAULT_MDP = '123456';

    credentials: LoginData = {
        email: this.DEFAULT_EMAIL,
        mdp: this.DEFAULT_MDP,
        rememberMe: false
    };

    isLoading = false;
    fieldErrors: { [key: string]: string } = {};

    constructor(
        private authService: AuthService,
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
                        'Connexion réussie ! Redirection vers le dashboard...',
                        'Bienvenue'
                    );

                    setTimeout(() => {
                        this.router.navigate(['/liste-produit-client']);
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
                const errorMessages: { [key: number]: string } = {
                    401: 'Email ou mot de passe incorrect',
                    400: 'Données invalides',
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