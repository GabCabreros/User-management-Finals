import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { first } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

import { AccountService } from '../_services/account.service';
import { AlertService } from '../_services/alert.service';

@Component({
    templateUrl: 'login.component.html',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule
    ]
})
export class LoginComponent implements OnInit {
    form!: UntypedFormGroup;
    loading = false;
    submitted = false;
    errorType: string = '';

    constructor(
        private formBuilder: UntypedFormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private accountService: AccountService,
        private alertService: AlertService
    ) { }

    ngOnInit() {
        this.form = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required]
        });
    }

    // convenience getter for easy access to form fields
    get f() { return this.form.controls; }

    onSubmit() {
        this.submitted = true;
        this.errorType = '';
        
        // reset alerts on submit
        this.alertService.clear();
        
        // stop here if form is invalid
        if (this.form.invalid) {
            return;
        }
        
        this.loading = true;
        this.accountService.login(this.f.email.value, this.f.password.value)
            .pipe(first())
            .subscribe({
                next: () => {
                    // get return url from query parameters or default to home page
                    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
                    this.router.navigateByUrl(returnUrl);
                },
                error: error => {
                    // Categorize errors to provide more helpful guidance
                    if (error.includes('Email does not exist')) {
                        this.errorType = 'email';
                        this.alertService.error('This email address is not registered in our system.', { autoClose: false });
                    } else if (error.includes('Password is incorrect')) {
                        this.errorType = 'password';
                        this.alertService.error('The password you entered is incorrect.', { autoClose: false });
                    } else if (error.includes('Email not verified')) {
                        this.errorType = 'verification';
                        this.alertService.error('Your email is not verified. Please check your inbox for verification instructions.', { autoClose: false, keepAfterRouteChange: false });
                    } else if (error.includes('Account is inactive')) {
                        this.errorType = 'inactive';
                        this.alertService.error('Your account is currently inactive. Please contact an administrator.', { autoClose: false, keepAfterRouteChange: false });
                    } else {
                        // Generic error
                        this.alertService.error(error);
                    }
                    this.loading = false;
                }
            });
    }
}
