import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { NotificationService } from '../services/notification.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notification = inject(NotificationService);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Rediriger vers la page de login avec un message
  notification.error('Veuillez vous connecter pour accéder à cette page');
  router.navigate(['/login'], { 
    queryParams: { returnUrl: state.url }
  });
  
  return false;
};