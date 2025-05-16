import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { first } from 'rxjs/operators';

import { AccountService, RequestService, AlertService } from '../_services';
import { RequestModel } from '../_models';

@Component({
    selector: 'app-view',
    templateUrl: './view.component.html',
    standalone: true,
    imports: [CommonModule, RouterModule]
})
export class ViewComponent implements OnInit {
    id: string = '';
    request?: RequestModel;
    loading = false;
    
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private requestService: RequestService,
        private accountService: AccountService,
        private alertService: AlertService
    ) {}
    
    ngOnInit() {
        this.id = this.route.snapshot.params['id'];
        this.loading = true;
        this.loadRequest();
    }
    
    loadRequest() {
        this.requestService.getById(this.id)
            .pipe(first())
            .subscribe({
                next: (request) => {
                    this.request = request;
                    this.loading = false;
                },
                error: (error) => {
                    this.alertService.error(error);
                    this.loading = false;
                    this.router.navigateByUrl('/requests/list');
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