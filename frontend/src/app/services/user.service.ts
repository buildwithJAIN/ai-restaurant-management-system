// src/app/services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
    private apiUrl = 'http://localhost:5000/api/staff'; // 👈 adjust if needed

    constructor(private http: HttpClient) { }

    // ✅ Get all users with waiter role
    getWaiters(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/waiters`);
    }
}
