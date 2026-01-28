import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:8888/api';

  constructor(private http: HttpClient) { }

  checkHealth(): Observable<any> {
    return this.http.get(`${this.apiUrl}/health`);
  }
}