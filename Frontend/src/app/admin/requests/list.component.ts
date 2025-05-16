import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { first } from 'rxjs/operators';

import { RequestService } from '@app/_services';
import { RequestModel } from '@app/_models';

@Component({ 
    templateUrl: 'list.component.html',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule
    ]
})
export class ListComponent implements OnInit {
    requests: RequestModel[] = [];

    constructor(private requestService: RequestService) {}

    ngOnInit() {
        this.requestService.getAll()
            .pipe(first())
            .subscribe({
                next: requests => this.requests = requests,
                error: error => console.error('Error loading requests:', error)
            });
    }

    deleteRequest(id: string) {
        const request = this.requests.find(x => x.id === id);
        if (!request) return;
        request.isDeleting = true;
        this.requestService.delete(id)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.requests = this.requests.filter(x => x.id !== id);
                },
                error: error => console.error('Error deleting request:', error)
            });
    }
} 