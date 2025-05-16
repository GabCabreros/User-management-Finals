import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AccountService } from '../_services/account.service';

@Component({ 
    templateUrl: 'layout.component.html',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule
    ]
})
export class LayoutComponent {
    constructor(
        private router: Router,
        private accountService: AccountService
    ) {
        // redirect to home if already logged in
        if (this.accountService.accountValue) {
            this.router.navigate(['/']);
        }
    }
}
