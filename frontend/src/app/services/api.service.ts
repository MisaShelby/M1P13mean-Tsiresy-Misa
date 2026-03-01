import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ApiService {

    private apiUrl = 'http://mean-local.wip:8888';

    constructor(private http: HttpClient) { }

    checkHealth(): Observable<any> {
        return this.http.get(`${this.apiUrl}/test`);
    }

    getBoutiquesEnAttente(): Observable<any> {
        return this.http.get(`${this.apiUrl}/auth/liste-validation-inscri-boutique`);
    }

    validerBoutique(id: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/auth/validation-inscri-boutique`, { id });
    }

    refuserBoutique(id: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/auth/refut-inscri-boutique`, { id });
    }

    // Produits
    getListeProduits(params?: any): Observable<any> {
        return this.http.get(`${this.apiUrl}/auth/liste-produit`, { params });
    }

    createProduit(produitData: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/auth/create-produit`, produitData);
    }

    updateProduit(id: string, produitData: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/auth/update-produit/${id}`, produitData);
    }

    // Stocks
    getStocks(): Observable<any> {
        return this.http.get(`${this.apiUrl}/auth/stocks`);
    }

    updateStock(id_produit: string, quantite: number): Observable<any> {
        return this.http.put(`${this.apiUrl}/auth/stock`, { id_produit, quantite });
    }

    ajouterStock(id_produit: string, quantite: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/auth/stock/ajouter`, { id_produit, quantite });
    }

    // Promotions
    addPromotion(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/auth/promotion`, data);
    }

    getAllPromotions(): Observable<any> {
        return this.http.get(`${this.apiUrl}/auth/promotions`);
    }

    getPromotionsByProduit(id_produit: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/auth/promotions/${id_produit}`);
    }

    updatePromotion(id: string, data: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/auth/promotion/${id}`, data);
    }

    deletePromotion(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/auth/promotion/${id}`);
    }
}