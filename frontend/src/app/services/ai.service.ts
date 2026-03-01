import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AIService {
    private baseUrl = 'http://localhost:5000/api/ai';

    constructor(private http: HttpClient) { }

    // Generate description using prompt + item data
    generateDescription(data: {
        name: string;
        category: string;
        imageUrl?: string | null;
    }): Observable<{ description: string }> {
        return this.http.post<{ description: string }>(
            `${this.baseUrl}/generate-description`,
            data
        );
    }
}
