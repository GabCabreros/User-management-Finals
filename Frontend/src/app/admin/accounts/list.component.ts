import { Component, OnInit, OnDestroy } from '@angular/core';
import { first } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { AccountService } from '../../_services/account.service';
import { AlertService } from '../../_services/alert.service';
import { Account } from '../../_models/account';

@Component({ 
    templateUrl: 'list.component.html',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule
    ]
})
export class ListComponent implements OnInit, OnDestroy {
    accounts: Account[] = [];
    loading = false;
    private subscriptions: Subscription[] = [];

    constructor(
        private accountService: AccountService,
        private alertService: AlertService,
        private route: ActivatedRoute,
        private router: Router
    ) {}

    ngOnInit() {
        // Load accounts initially
        this.loadAccounts();
        
        // Subscribe to navigation events to refresh data when returning from edit page
        const routerSubscription = this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))
            .subscribe(() => {
                // Only reload if we're on the accounts list page
                if (this.router.url.includes('/admin/accounts') && !this.router.url.includes('/edit/') && !this.router.url.includes('/add')) {
                    console.log('Returned to accounts list, reloading data');
                    this.loadAccounts();
                }
            });
        
        this.subscriptions.push(routerSubscription);
    }

    ngOnDestroy() {
        // Clean up subscriptions to prevent memory leaks
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    loadAccounts() {
        this.loading = true;
        this.accountService.getAll()
            .pipe(first())
            .subscribe({
                next: accounts => {
                    // Process accounts to ensure status values are normalized
                    this.accounts = accounts.map(account => {
                        // Ensure status is properly capitalized
                        if (account.status) {
                            account.status = account.status === 'Inactive' || account.status === 'inactive' 
                                ? 'Inactive' 
                                : 'Active';
                        } else {
                            account.status = 'Active'; // Default value if missing
                        }
                        return account;
                    });
                    
                    this.loading = false;
                },
                error: error => {
                    console.error('Error loading accounts:', error);
                    this.alertService.error('Error loading accounts: ' + error);
                    this.loading = false;
                }
            });
    }

    deleteAccount(id: string) {
        const account = this.accounts.find(x => x.id === id);
        if (!account) return;
        account.isDeleting = true;
        this.accountService.delete(id)
            .pipe(first())
            .subscribe(() => {
                this.accounts = this.accounts.filter(x => x.id !== id);
            });
    }
    
    // Force a hard refresh from server
    refreshList() {
        this.loadAccounts();
        this.alertService.info('Refreshing account list...', { autoClose: true });
    }
}
