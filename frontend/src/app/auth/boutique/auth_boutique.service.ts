import { BehaviorSubject, Observable, tap } from "rxjs";

import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

export interface Boutique {
    _id: string;
    nom_boutique: string;
    photo: string;
    email: string;
    nom_gerant: string;
    telephone_gerant: string;
    commission_type?: {
        _id: string;
        nom: string;
        tarif: number;
        description?: string;
    } | null;
    portefeuille: number;
    createdAt: string;
    updatedAt: string;
}

export interface RegisterBoutiqueData {
    nom_boutique: string;
    photo: string;
    email: string;
    nom_gerant: string;
    telephone_gerant: string;
    mdp: string;
    confirmMdp: string;
    photoPreview?: string;
}

export interface LoginBoutiqueData {
    nom_boutique: string;
    mdp: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    token?: string;
    boutique?: Boutique;
    requires_setup?: boolean;
    errors?: Array<{
        field: string;
        message: string;
    }>;
}

@Injectable({
    providedIn: 'root'
})

export class AuthBoutiqueService {
    private apiUrl = 'http://mean-local.wip:8888/auth';
    private currentBoutiqueSubject = new BehaviorSubject<Boutique | null>(null);
    public currentBoutique$ = this.currentBoutiqueSubject.asObservable();

    constructor(private http: HttpClient) {
        this.loadStoredBoutique();
    }

    private setSession(response: AuthResponse): void {
        if (response.token) {
            localStorage.setItem('token', response.token);
        }
        if (response.boutique) {
            localStorage.setItem('boutique', JSON.stringify(response.boutique));
            this.currentBoutiqueSubject.next(response.boutique);
        }
        // Stocker le flag de premier setup
        localStorage.setItem('boutique_requires_setup', response.requires_setup ? 'true' : 'false');
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    getCurrentBoutique(): Boutique | null {
        return this.currentBoutiqueSubject.value;
    }

    private loadStoredBoutique(): void {
        const boutiqueStr = localStorage.getItem('boutique');
        if (boutiqueStr) {
            try {
                const boutique = JSON.parse(boutiqueStr);
                this.currentBoutiqueSubject.next(boutique);
            } catch (e) {
                this.logout();
            }
        }
    }

    register(boutiqueData: RegisterBoutiqueData): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/register-boutique`, boutiqueData)
            .pipe(
                tap(response => {
                    if (response.success && response.token && response.boutique) {
                        this.setSession(response);
                    }
                })
            );
    }

    login(credentials: LoginBoutiqueData): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login-boutique`, credentials)
            .pipe(
                tap(response => {
                    if (response.success && response.token && response.boutique) {
                        this.setSession(response);
                    } else {
                        console.log('Login échoué:', response.message);
                    }
                })
            );
    }

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

    requiresSetup(): boolean {
        return localStorage.getItem('boutique_requires_setup') === 'true';
    }

    clearSetupFlag(): void {
        localStorage.setItem('boutique_requires_setup', 'false');
        // Mettre à jour la boutique stockée
        const boutiqueStr = localStorage.getItem('boutique');
        if (boutiqueStr) {
            try {
                const boutique = JSON.parse(boutiqueStr);
                this.currentBoutiqueSubject.next(boutique);
            } catch (e) {}
        }
    }

    souscriptionPremierMois(commission_type_id: string): Observable<any> {
        const headers = { Authorization: `Bearer ${this.getToken()}` };
        return this.http.post<any>(`${this.apiUrl}/boutique-setup`, { commission_type_id }, { headers });
    }

    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('boutique');
        localStorage.removeItem('boutique_requires_setup');
        this.currentBoutiqueSubject.next(null);
    }

}