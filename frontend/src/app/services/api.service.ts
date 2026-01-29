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
}