// src/app/services/menu.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MenuItem } from '../models/menu-Item.model';

@Injectable({ providedIn: 'root' })
export class MenuService {
    private apiUrl = 'http://localhost:5000/api/menu';
    // Base API endpoints
    private base = '/api/menu';
    private uploadBase = '/api/upload';

    constructor(private http: HttpClient) { }

    /** 🟢 Get all menu items */
    list(): Observable<MenuItem[]> {
        return this.http.get<MenuItem[]>(this.base);
    }

    /** 🟢 Create a new menu item */
    create(data: FormData) {
        return this.http.post<MenuItem>(this.apiUrl, data)
    }

    update(id: number, data: FormData) {
        return this.http.put<MenuItem>(`/api/menu/${id}`, data);
    }


    /** 🟢 Delete (renamed to match component) */
    remove(id: number): Observable<string> {
        return this.http.delete(`${this.base}/${id}`, { responseType: 'text' });
    }

    /** 🟢 Upload image file and get back URL */
    uploadImage(file: File): Observable<{ url: string }> {
        const form = new FormData();
        form.append('image', file);
        return this.http.post<{ url: string }>(`${this.uploadBase}/image`, form);
    }
}
