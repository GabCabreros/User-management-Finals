import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { first } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

import { AccountService } from '../../_services/account.service';
import { AlertService } from '../../_services/alert.service';
import { MustMatch } from '../../_helpers/must-match.validator';

@Component({
    templateUrl: 'add-edit.component.html',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule
    ]
})
export class AddEditComponent implements OnInit {
    form!: FormGroup;
    id?: string;
    isAddMode!: boolean;
    loading = false;
    submitting = false;
    submitted = false;
    originalStatus: string = 'Active';
    deleting = false;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private accountService: AccountService,
        private alertService: AlertService
    ) { }

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];
        this.isAddMode = !this.id;
        
        // form with validation rules
        this.form = this.formBuilder.group({
            title: ['', Validators.required],
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            role: ['', Validators.required],
            status: ['Active', Validators.required],
            password: ['', [
                // password is required in add mode
                ...(this.isAddMode ? [Validators.required] : []),
                // min length 6 characters if value is entered
                Validators.minLength(6)
            ]],
            confirmPassword: ['', this.isAddMode ? Validators.required : []]
        }, {
            validators: MustMatch('password', 'confirmPassword')
        });

        if (!this.isAddMode) {
            // edit mode
            this.loading = true;
            this.accountService.getById(this.id!)
                .pipe(first())
                .subscribe({
                    next: account => {
                        // Patch form with account data
                        this.form.patchValue(account);
                        this.originalStatus = account.status || 'Active';
                        this.loading = false;
                    },
                    error: error => {
                        this.alertService.error('Error loading account: ' + error);
                        this.loading = false;
                    }
                });
        }

        // Watch for status changes to provide feedback
        this.form.get('status')?.valueChanges.subscribe(newStatus => {
            if (!this.isAddMode && newStatus !== this.originalStatus) {
                if (newStatus === 'Inactive') {
                    this.alertService.warn('Warning: You are about to inactivate this employee\'s account. They will lose access to the system.', { autoClose: false });
                } else {
                    this.alertService.clear();
                }
            } else {
                this.alertService.clear();
            }
        });
    }

    // convenience getter for easy access to form fields
    get f() { return this.form.controls; }

    onSubmit() {
        this.submitted = true;

        // reset alerts on submit
        this.alertService.clear();

        // stop here if form is invalid
        if (this.form.invalid) {
            return;
        }

        this.submitting = true;

        // Make sure status is included in the data with correct capitalization
        const formData = {
            ...this.form.value,
            status: this.form.value.status === 'Inactive' ? 'Inactive' : 'Active'
        };

        // create or update account based on isAddMode
        let saveAccount = this.isAddMode
            ? this.accountService.create(formData)
            : this.accountService.update(this.id!, formData);
            
        saveAccount
            .pipe(first())
            .subscribe({
                next: () => {
                    // Show success message
                    if (!this.isAddMode && formData.status !== this.originalStatus) {
                        const statusMessage = formData.status === 'Active' ? 'activated' : 'inactivated';
                        this.alertService.success(`Account has been ${statusMessage} successfully`, { keepAfterRouteChange: true });
                    } else {
                        this.alertService.success('Account saved successfully', { keepAfterRouteChange: true });
                    }
                    
                    // Go back to the account list
                    this.router.navigateByUrl('/admin/accounts');
                },
                error: error => {
                    this.alertService.error(error);
                    this.submitting = false;
                }
            });
    }

    onDelete() {
        if (!this.id) return;
        
        // Show confirmation dialog
        if (confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
            this.deleting = true;
            this.accountService.delete(this.id)
                .pipe(first())
                .subscribe({
                    next: () => {
                        this.alertService.success('Account deleted successfully', { keepAfterRouteChange: true });
                        this.router.navigateByUrl('/admin/accounts');
                    },
                    error: error => {
                        this.alertService.error(error);
                        this.deleting = false;
                    }
                });
        }
    }
}
