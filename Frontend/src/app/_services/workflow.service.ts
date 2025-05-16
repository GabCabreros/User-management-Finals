import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Workflow } from '../_models';

const baseUrl = `${environment.apiUrl}/workflows`;

@Injectable({ providedIn: 'root' })
export class WorkflowService {
    constructor(
        private router: Router,
        private http: HttpClient
    ) { }

    getAll(): Observable<Workflow[]> {
        return this.http.get<Workflow[]>(baseUrl);
    }

    getByEmployeeId(employeeId: string): Observable<Workflow[]> {
        return this.http.get<Workflow[]>(`${baseUrl}/employee/${employeeId}`);
    }

    getById(id: string): Observable<Workflow> {
        return this.http.get<Workflow>(`${baseUrl}/${id}`);
    }

    create(params: any): Observable<Workflow> {
        return this.http.post<Workflow>(baseUrl, params);
    }

    update(id: string, params: any): Observable<Workflow> {
        return this.http.put<Workflow>(`${baseUrl}/${id}`, params);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${baseUrl}/${id}`);
    }
} 