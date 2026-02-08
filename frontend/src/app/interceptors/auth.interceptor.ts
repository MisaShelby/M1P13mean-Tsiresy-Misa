import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notification = inject(NotificationService);
  
  const token = authService.getToken();
  
  let authReq = req;
  
  // Ajouter le token aux requêtes si disponible
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  return next(authReq).pipe(
    catchError(error => {
      // Gérer les erreurs 401 (non autorisé)
      if (error.status === 401) {
        authService.logout();
        notification.error('Session expirée. Veuillez vous reconnecter.');
        router.navigate(['/login']);
      }
      
      return throwError(() => error);
    })
  );
};