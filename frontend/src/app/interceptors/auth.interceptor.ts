// interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth/client/auth.service';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const notification = inject(NotificationService);

    const authUrls = ['/auth/login', '/auth/register'];
    const isAuthRequest = authUrls.some(url => req.url.includes(url));

    let authReq = req;

    if (!isAuthRequest) {
        const token = authService.getToken();
        
        if (token) {
            authReq = req.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`
                }
            });
        }
    }

    return next(authReq).pipe(
        catchError(error => {
            if (error.status === 401) {
                authService.logout();
                notification.error('Session expirée. Veuillez vous reconnecter.');
                router.navigate(['/login']);
            }

            return throwError(() => error);
        })
    );
};