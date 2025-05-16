import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AccountService } from '../_services/account.service';
import { Role } from '../_models/role';

@Component({ 
    templateUrl: 'details.component.html',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule
    ]
})
export class DetailsComponent {
    account = this.accountService.accountValue;
    Role = Role;
    
    constructor(
        private accountService: AccountService,
        private router: Router
    ) { 
        if (!this.account) {
            this.router.navigate(['/account/login']);
        }
    }
}
