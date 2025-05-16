import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Department } from '../_models';

const baseUrl = `${environment.apiUrl}/departments`;

@Injectable({ providedIn: 'root' })
export class DepartmentService {
    constructor(
        private router: Router,
        private http: HttpClient
    ) { }

    getAll(): Observable<Department[]> {
        return this.http.get<Department[]>(baseUrl);
    }

    getById(id: string): Observable<Department> {
        return this.http.get<Department>(`${baseUrl}/${id}`);
    }

    create(params: any): Observable<Department> {
        return this.http.post<Department>(baseUrl, params);
    }

    update(id: string, params: any): Observable<Department> {
        return this.http.put<Department>(`${baseUrl}/${id}`, params);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${baseUrl}/${id}`);
    }
} 