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
}