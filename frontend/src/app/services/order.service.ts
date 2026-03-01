import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OrderService {
    private baseUrl = 'http://localhost:5000/api/orders';

    constructor(private http: HttpClient) { }

    createOrder(payload: any): Observable<any> {
        return this.http.post(`${this.baseUrl}/create`, payload);
    }
    updateStatus(orderId: number, status: string) {
        return this.http.put(`${this.baseUrl}/orders/${orderId}/status`, { status });
    }

}
