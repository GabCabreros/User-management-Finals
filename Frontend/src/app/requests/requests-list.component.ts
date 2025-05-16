import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-requests-list',
    template: `
    <div class="card">
        <div class="card-header">
            <div class="d-flex justify-content-between align-items-center">
                <h4>My Requests</h4>
                <a routerLink="../add" class="btn btn-primary">New Request</a>
            </div>
        </div>
        <div class="card-body">
            <p>Loading request list...</p>
            <a routerLink="../add" class="btn btn-primary">Create New Request</a>
        </div>
    </div>
    `,
    standalone: true,
    imports: [CommonModule, RouterModule]
})
export class RequestsListComponent {
    constructor() {}
} 