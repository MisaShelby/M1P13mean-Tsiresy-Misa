// services/auth-type.service.ts

import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';

export type UserType = 'admin' | 'boutique' | 'client' | null;

@Injectable({
    providedIn: 'root'
})
export class AuthTypeService {
    private userTypeSubject = new BehaviorSubject<UserType>(null);
    public userType$ = this.userTypeSubject.asObservable();

    constructor() {
        this.checkUserType();
    }

    checkUserType(): UserType {
        if (localStorage.getItem('admin')) {
            this.userTypeSubject.next('admin');
            return 'admin';
        } else if (localStorage.getItem('boutique')) {
            this.userTypeSubject.next('boutique');
            return 'boutique';
        } else if (localStorage.getItem('user')) {
            this.userTypeSubject.next('client');
            return 'client';
        } else {
            this.userTypeSubject.next(null);
            return null;
        }
    }

    getUserType(): UserType {
        return this.userTypeSubject.value;
    }

    logout() {
        this.userTypeSubject.next(null);
    }
}