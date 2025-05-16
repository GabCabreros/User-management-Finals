import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-requests-view',
    template: `
    <div class="card">
        <div class="card-header">
            <div class="d-flex justify-content-between align-items-center">
                <h4>Request Details</h4>
                <a routerLink="../list" class="btn btn-secondary">Back to List</a>
            </div>
        </div>
        <div class="card-body">
            <p>Loading request details...</p>
            <a routerLink="../list" class="btn btn-secondary">Back to List</a>
        </div>
    </div>
    `,
    standalone: true,
    imports: [CommonModule, RouterModule]
})
export class RequestsViewComponent {
    constructor() {}
} 