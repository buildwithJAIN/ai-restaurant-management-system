// frontend/src/app/services/chef.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ChefService {
    private baseUrl = 'http://localhost:5000/api/chef';

    constructor(private http: HttpClient) { }

    private headers(chefId: number) {
        return { headers: new HttpHeaders({ 'x-chef-id': String(chefId) }) };
    }

    getPending(): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/orders/pending`);
    }

    getInProgress(chefId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/orders/in-progress`, this.headers(chefId));
    }

    getCompleted(chefId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/orders/completed`, this.headers(chefId));
    }

    startCooking(orderId: number, chefId: number): Observable<any> {
        return this.http.patch(`${this.baseUrl}/orders/start/${orderId}`, { chefId }, this.headers(chefId));
    }

    markReady(orderId: number, chefId: number): Observable<any> {
        return this.http.patch(`${this.baseUrl}/orders/ready/${orderId}`, {}, this.headers(chefId));
    }
}
