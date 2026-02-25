import { BehaviorSubject, Observable } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';

export interface User {
    _id: string;
    nom_complet: string;
    email: string;
    telephone: string;
    createdAt: string;
    updatedAt: string;
}

export interface RegisterData {
    nom_complet: string;
    email: string;
    telephone: string;
    mdp: string;
    confirmPassword: string;
}

export interface LoginData {
    email: string;
    mdp: string;
    rememberMe?: boolean;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    token?: string;
    user?: User;
    errors?: Array<{
        field: string;
        message: string;
    }>;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'http://mean-local.wip:8888/auth';
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient) {
        this.loadStoredUser();
    }

    /**
     * Inscription
     */
    register(userData: RegisterData): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData)
            .pipe(
                tap(response => {
                    if (response.success && response.token && response.user) {
                        this.setSession(response);
                    }
                })
            );
    }

    /**
     * Connexion
     */
    login(credentials: LoginData): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
            .pipe(
                tap(response => {
                    if (response.success && response.token && response.user) {
                        this.setSession(response);
                        localStorage.getItem('token');
                        localStorage.getItem('user');

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
        localStorage.removeItem('user');
        this.currentUserSubject.next(null);
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
    getCurrentUser(): User | null {
        return this.currentUserSubject.value;
    }

    /**
     * Charger l'utilisateur depuis le stockage local
     */
    private loadStoredUser(): void {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                this.currentUserSubject.next(user);
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
        if (response.user) {
            localStorage.setItem('user', JSON.stringify(response.user));
            this.currentUserSubject.next(response.user);
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