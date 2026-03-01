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

    // Produits Client
    getProduitsClient(params?: any): Observable<any> {
        return this.http.get(`${this.apiUrl}/auth/produits-client`, { params });
    }

    // Boutiques Client
    getBoutiquesClient(): Observable<any> {
        return this.http.get(`${this.apiUrl}/auth/boutiques-client`);
    }

    getBoutiqueDetailClient(id: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/auth/boutique-detail-client/${id}`);
    }

    // Panier Client
    creerPanier(nom: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/auth/panier`, { nom });
    }

    creerPanierAvecProduit(data: { nom: string; id_produit: string; quantite: number; prix_unitaire: number; id_boutique: string }): Observable<any> {
        return this.http.post(`${this.apiUrl}/auth/panier-avec-produit`, data);
    }

    getPaniersActifs(): Observable<any> {
        return this.http.get(`${this.apiUrl}/auth/paniers-actifs`);
    }

    getTousPaniers(): Observable<any> {
        return this.http.get(`${this.apiUrl}/auth/paniers`);
    }

    ajouterProduitAuPanier(data: { id_panier: string; id_produit: string; quantite: number; prix_unitaire: number; id_boutique: string }): Observable<any> {
        return this.http.post(`${this.apiUrl}/auth/panier-produit`, data);
    }

    supprimerProduitDuPanier(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/auth/panier-produit/${id}`);
    }

    changerStatutPanier(id: string, statut: string): Observable<any> {
        return this.http.put(`${this.apiUrl}/auth/panier/${id}/statut`, { statut });
    }

    supprimerPanier(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/auth/panier/${id}`);
    }

    // Commandes Client
    creerCommande(data: { id_panier: string; paiement: string; adresse_livraison: string }): Observable<any> {
        return this.http.post(`${this.apiUrl}/auth/commande`, data);
    }

    getMesCommandes(): Observable<any> {
        return this.http.get(`${this.apiUrl}/auth/mes-commandes`);
    }

    getCommandeDetail(id: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/auth/commande/${id}`);
    }

    updateStatutCommande(id: string, statut: string): Observable<any> {
        return this.http.put(`${this.apiUrl}/auth/commande/${id}/statut`, { statut });
    }

    // Commandes Boutique
    getCommandesBoutique(): Observable<any> {
        return this.http.get(`${this.apiUrl}/auth/commandes-boutique`);
    }

    confirmerPreparationCommande(id_commande: string): Observable<any> {
        return this.http.put(`${this.apiUrl}/auth/commande-boutique/${id_commande}/confirmer`, {});
    }

    // Admin - Boutiques
    getBoutiquesAdmin(): Observable<any> {
        return this.http.get(`${this.apiUrl}/auth/admin/boutiques`);
    }

    getStatistiquesAdmin(): Observable<any> {
        return this.http.get(`${this.apiUrl}/auth/admin/statistiques`);
    }
}