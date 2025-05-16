import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AccountService } from './_services/account.service';
import { Account } from './_models/account';
import { Role } from './_models/role';
import { AlertComponent } from './_components/alert.component';

@Component({ 
  selector: 'app', 
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AlertComponent
  ]
})
export class AppComponent {
    Role = Role;
    account: Account | null = null;

    constructor(private accountService: AccountService) {
        this.accountService.account.subscribe(x => this.account = x);
    }

    logout() {
        this.accountService.logout();
    }
}
