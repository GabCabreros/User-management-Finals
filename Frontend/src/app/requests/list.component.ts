import { Component, OnInit, OnDestroy } from '@angular/core';
import { first } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { interval, Subscription } from 'rxjs';

import { AccountService, RequestService, AlertService } from '../_services';
import { RequestModel } from '../_models';

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    standalone: true,
    imports: [CommonModule, RouterModule]
})
export class ListComponent implements OnInit, OnDestroy {
    requests: RequestModel[] = [];
    loading = false;
    private pollingSubscription: Subscription | null = null;
    public pollingInterval = 10000; // 10 seconds polling interval
    
    constructor(
        private accountService: AccountService,
        private requestService: RequestService,
        private alertService: AlertService
    ) {}
    
    ngOnInit() {
        this.loading = true;
        this.loadRequests();
        
        // Set up polling for real-time updates
        this.startPolling();
    }
    
    ngOnDestroy() {
        // Clean up subscription when component is destroyed
        this.stopPolling();
    }
    
    // Start polling for updates
    private startPolling() {
        // Cancel any existing subscription
        this.stopPolling();
        
        // Set up new polling subscription
        this.pollingSubscription = interval(this.pollingInterval)
            .subscribe(() => {
                this.loadRequests(false); // Silent refresh (no UI notification)
            });
    }
    
    // Stop polling
    private stopPolling() {
        if (this.pollingSubscription) {
            this.pollingSubscription.unsubscribe();
            this.pollingSubscription = null;
        }
    }
    
    // Force a manual refresh with notification
    refreshList() {
        this.loadRequests(true);
        this.alertService.info('Refreshing requests...', { autoClose: true });
    }
    
    loadRequests(showLoading = true) {
        // Get the current user account
        const account = this.accountService.accountValue;
        
        if (!account) {
            this.alertService.error('You must be logged in to view requests');
            this.loading = false;
            return;
        }
        
        if (showLoading) {
            this.loading = true;
        }
        
        // Load all requests for the current user
        this.requestService.getAllByAccount(account.id)
            .pipe(first())
            .subscribe({
                next: (requests) => {
                    this.requests = requests;
                    this.loading = false;
                },
                error: (error) => {
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
    }
    
    getStatusClass(status: string): string {
        switch (status) {
            case 'Approved':
                return 'bg-success text-white';
            case 'Rejected':
                return 'bg-danger text-white';
            case 'Completed':
                return 'bg-info text-white';
            default:
                return 'bg-warning';
        }
    }
} 