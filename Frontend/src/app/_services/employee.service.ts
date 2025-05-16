import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Employee } from '../_models';

const baseUrl = `${environment.apiUrl}/employees`;

@Injectable({ providedIn: 'root' })
export class EmployeeService {
    constructor(
        private router: Router,
        private http: HttpClient
    ) { }

    getAll(): Observable<Employee[]> {
        return this.http.get<Employee[]>(baseUrl);
    }

    getById(id: string): Observable<Employee> {
        return this.http.get<Employee>(`${baseUrl}/${id}`);
    }

    create(params: any): Observable<Employee> {
        return this.http.post<Employee>(baseUrl, params);
    }

    update(id: string, params: any): Observable<Employee> {
        return this.http.put<Employee>(`${baseUrl}/${id}`, params);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${baseUrl}/${id}`);
    }

    transferDepartment(id: string, departmentId: string, updatedBy: string): Observable<Employee> {
        return this.http.put<Employee>(`${baseUrl}/${id}/transfer`, { departmentId, updatedBy });
    }
} 