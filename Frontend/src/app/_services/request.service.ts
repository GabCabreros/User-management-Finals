import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { RequestModel } from '../_models';

const baseUrl = `${environment.apiUrl}/requests`;

@Injectable({ providedIn: 'root' })
export class RequestService {
    constructor(
        private router: Router,
        private http: HttpClient
    ) { }

    getAll(): Observable<RequestModel[]> {
        return this.http.get<RequestModel[]>(baseUrl);
    }

    getAllByAccount(accountId: string): Observable<RequestModel[]> {
        return this.http.get<RequestModel[]>(`${baseUrl}/account/${accountId}`);
    }

    getById(id: string): Observable<RequestModel> {
        return this.http.get<RequestModel>(`${baseUrl}/${id}`);
    }

    create(params: any): Observable<RequestModel> {
        return this.http.post<RequestModel>(baseUrl, params);
    }

    update(id: string, params: any): Observable<RequestModel> {
        return this.http.put<RequestModel>(`${baseUrl}/${id}`, params);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${baseUrl}/${id}`);
    }
} 