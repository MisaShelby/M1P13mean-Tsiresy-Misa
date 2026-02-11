import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface Admin {
    _id: string;
    nom_complet: string;
    email: string;
    telephone: string;
    createdAt: string;
    updatedAt: string;
}

export interface RegisterAdminData {
    nom_complet: string;
    email: string;
    telephone: string;
    mdp: string;
    confirmPassword: string;
}

export interface LoginAdminData {
    email: string;
    mdp: string;
    rememberMe?: boolean;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    token?: string;
    admin?: Admin;
    errors?: Array<{
        field: string;
        message: string;
    }>;
}

@Injectable({
    providedIn: 'root'
})
export class AuthAdminService {
    private apiUrl = 'http://mean-local.wip:8888/auth';
    private currentAdminSubject = new BehaviorSubject<Admin | null>(null);
    public currentAdmin$ = this.currentAdminSubject.asObservable();

    constructor(private http: HttpClient) {
        this.loadStoredUser();
    }

    /**
     * Inscription
     */
    register(adminData: RegisterAdminData): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/register-admin`, adminData)
            .pipe(
                tap(response => {
                    if (response.success && response.token && response.admin) {
                        this.setSession(response);
                    }
                })
            );
    }

    /**
     * Connexion
     */
    login(credentials: LoginAdminData): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login-admin`, credentials)
            .pipe(
                tap(response => {
                    if (response.success && response.token && response.admin) {
                        this.setSession(response);
                        localStorage.getItem('token');
                        localStorage.getItem('admin');

                    } else {
                        console.log('Login échoué:', response.message);
                    }
                })
            );
    }

    /**
     * Déconnexion
     */
    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('admin');
        this.currentAdminSubject.next(null);
    }

    /**
     * Vérifier si l'utilisateur est connecté
     */
    isAuthenticated(): boolean {
        const token = this.getToken();

        if (!token) {
            console.log('❌ Pas de token trouvé');
            return false;
        }

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));

            const isExpired = payload.exp * 1000 < Date.now();

            if (isExpired) {
                this.logout();
                return false;
            }

            return true;
        } catch (error) {
            this.logout();
            return false;
        }
    }

    /**
     * Récupérer le token
     */
    getToken(): string | null {
        return localStorage.getItem('token');
    }

    /**
     * Récupérer l'utilisateur courant
     */
    getCurrentAdmin(): Admin | null {
        return this.currentAdminSubject.value;
    }

    /**
     * Charger l'utilisateur depuis le stockage local
     */
    private loadStoredUser(): void {
        const adminStr = localStorage.getItem('admin');
        if (adminStr) {
            try {
                const admin = JSON.parse(adminStr);
                this.currentAdminSubject.next(admin);
            } catch (e) {
                this.logout();
            }
        }
    }

    /**
     * Sauvegarder la session
     */
    private setSession(response: AuthResponse): void {

        if (response.token) {
            localStorage.setItem('token', response.token);
        }

        if (response.admin) {
            localStorage.setItem('admin', JSON.stringify(response.admin));
            this.currentAdminSubject.next(response.admin);
        }
    }

    /**
     * Récupérer le profil utilisateur
     */
    getProfile(): Observable<AuthResponse> {
        return this.http.get<AuthResponse>(`${this.apiUrl}/profile`, {
            headers: {
                'Authorization': `Bearer ${this.getToken()}`
            }
        });
    }
}