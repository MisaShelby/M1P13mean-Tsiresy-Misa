import { CommissionType } from './commission-type/commission-type.component';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class CommissionTypeService {

    private apiUrl = `${environment.apiUrl}/auth/commissionType`;

    constructor(private http: HttpClient) { }

    createCommissionType(data: CommissionType): Observable<CommissionType> {
        return this.http.post<CommissionType>(this.apiUrl, data);
    }

    getAllCommissionTypes(): Observable<CommissionType[]> {
        return this.http.get<CommissionType[]>(this.apiUrl);
    }

    getCommissionTypeById(id: string): Observable<CommissionType> {
        return this.http.get<CommissionType>(`${this.apiUrl}/${id}`);
    }

    updateCommissionType(id: string, data: CommissionType): Observable<CommissionType> {
        return this.http.put<CommissionType>(`${this.apiUrl}/${id}`, data);
    }

    deleteCommissionType(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }
}