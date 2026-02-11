import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../auth/client/auth.service';
import { NotificationService } from '../services/notification.service';

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const notification = inject(NotificationService);


    const isAuthenticated = authService.isAuthenticated();

    if (isAuthenticated) {
        return true;
    }

    notification.error('Veuillez vous connecter pour accéder à cette page');
    // router.navigate(['/accueil-general'],  {
    //     queryParams: { returnUrl: state.url }
    // });
    router.navigate(['/accueil-general'], { replaceUrl: true });

    return false;
};