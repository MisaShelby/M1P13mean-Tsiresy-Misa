import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CommissionType } from './commission-type/commission-type.component';


@Injectable({
  providedIn: 'root'
})
export class CommissionTypeService {

  private apiUrl = 'http://mean-local.wip:8888/auth/commissionType';

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