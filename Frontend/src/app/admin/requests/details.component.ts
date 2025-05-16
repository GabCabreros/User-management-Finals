import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';

import { RequestService } from '@app/_services';
import { RequestModel } from '@app/_models';

@Component({ templateUrl: 'details.component.html' })
export class DetailsComponent implements OnInit {
    id!: string;
    request?: RequestModel;
    loading = false;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private requestService: RequestService
    ) {}

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];
        this.loading = true;
        this.requestService.getById(this.id)
            .pipe(first())
            .subscribe(request => {
                this.request = request;
                this.loading = false;
            });
    }
} 