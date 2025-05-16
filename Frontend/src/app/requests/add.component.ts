import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { first } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

import { RequestService, AccountService, AlertService } from '@app/_services';
import { Account } from '@app/_models';

@Component({ 
    templateUrl: 'add.component.html',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule
    ]
})
export class AddComponent implements OnInit {
    form!: FormGroup;
    loading = false;
    submitting = false;
    submitted = false;
    accounts: any[] = [];
    types = ['Equipment', 'Leave', 'Resources', 'Other'];

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private requestService: RequestService,
        private accountService: AccountService,
        private alertService: AlertService
    ) {}

    ngOnInit() {
        const userId = this.route.snapshot.queryParams['userId'];
        
        this.form = this.formBuilder.group({
            accountId: [userId || null, Validators.required],
            type: ['Equipment', Validators.required],
            title: ['Request for items'], // Set a default title
            description: [''], 
            status: ['Pending'], // Hidden but maintained for backend
            items: this.formBuilder.array([])
        });
        
        // Add two empty items by default
        this.addItem();
        this.addItem();
        
        // Load accounts
        this.loading = true;
        this.accountService.getAll()
            .pipe(first())
            .subscribe({
                next: (accounts) => {
                    // Format accounts to include employeeId in the EMP001 format
                    this.accounts = accounts.map((account, index) => {
                        return {
                            ...account,
                            employeeId: `EMP${String(account.id || (index + 1)).padStart(3, '0')}`
                        };
                    });
                    
                    // If a userId was provided in query params, check if it's a valid account
                    if (userId) {
                        const userExists = this.accounts.some(account => account.id === userId);
                        if (userExists) {
                            // Pre-select the user
                            this.form.patchValue({ accountId: userId });
                            // Always disable the field for normal users
                            this.form.get('accountId')?.disable();
                        }
                    }
                    
                    this.loading = false;
                },
                error: (error) => {
                    this.alertService.error('Error loading accounts: ' + error);
                    console.error('Error loading accounts:', error);
                    this.loading = false;
                }
            });
    }
    
    // convenience getter for easy access to form fields
    get f() { return this.form.controls; }
    get itemsArray() { return this.form.get('items') as FormArray; }
    
    createItem(item: any = {}) {
        return this.formBuilder.group({
            id: [item.id || null],
            name: [item.name || '', Validators.required],
            description: [''], // Keep this field but not show it in the UI
            quantity: [item.quantity || 1, [Validators.required, Validators.min(1)]],
            status: ['Pending'] // Keep this field but not show it in the UI
        });
    }
    
    addItem() {
        this.itemsArray.push(this.createItem());
    }
    
    removeItem(index: number) {
        if (this.itemsArray.length > 1) {
            this.itemsArray.removeAt(index);
        } else {
            this.alertService.error('At least one item is required');
        }
    }
    
    onSubmit() {
        this.submitted = true;
        
        // reset alerts on submit
        this.alertService.clear();
        
        // stop here if form is invalid
        if (this.form.invalid) {
            return;
        }
        
        this.submitting = true;
        
        // get user id for createdBy
        const currentUser = this.accountService.accountValue;
        const userId = currentUser?.id;
        
        // Prepare form data including disabled fields
        const formData = {...this.form.getRawValue()};
        
        // Convert accountId to number if it's a string
        if (formData.accountId && typeof formData.accountId === 'string') {
            formData.accountId = parseInt(formData.accountId, 10);
        }
        
        this.requestService.create({ ...formData, createdBy: userId })
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Request created successfully', { keepAfterRouteChange: true });
                    this.router.navigateByUrl('/'); // Redirect to home
                },
                error: error => {
                    this.alertService.error(error);
                    console.error('Error creating request:', error);
                    this.submitting = false;
                }
            });
    }
} 