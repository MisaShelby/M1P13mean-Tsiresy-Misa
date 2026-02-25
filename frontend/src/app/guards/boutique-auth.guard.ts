import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthBoutiqueService } from '../auth/boutique/auth_boutique.service';
import { NotificationService } from '../services/notification.service';

export const boutiqueAuthGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthBoutiqueService);
    const router = inject(Router);
    const notification = inject(NotificationService);

    if (authService.isAuthenticated()) {
        return true;
    }

    notification.error('Veuillez vous connecter pour accéder à cette page');
    router.navigate(['/login-boutique'], { replaceUrl: true });
    return false;
};
