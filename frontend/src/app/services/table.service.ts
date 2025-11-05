import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TableService {
    private apiUrl = 'http://localhost:5000/api/tables';

    constructor(private http: HttpClient) { }

    getTables(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl);
    }

    createTable(data: any): Observable<any> {
        return this.http.post<any>(this.apiUrl, data);
    }

    updateTable(id: number, data: any) {
        return this.http.put<any>(`${this.apiUrl}/${id}`, data);
    }

}
