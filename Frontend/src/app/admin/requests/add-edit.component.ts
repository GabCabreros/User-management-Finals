import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { first } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

import { RequestService, AccountService, AlertService, WorkflowService, EmployeeService } from '@app/_services';
import { Account } from '@app/_models';

@Component({ 
    templateUrl: 'add-edit.component.html',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule
    ]
})
export class AddEditComponent implements OnInit {
    form!: FormGroup;
    id?: string;
    loading = false;
    submitting = false;
    submitted = false;
    accounts: any[] = [];
    employees: any[] = [];
    types = ['Equipment', 'Leave', 'Resources', 'Other'];
    statuses = ['Pending', 'Approved', 'Rejected', 'Completed'];
    originalStatus?: string;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private requestService: RequestService,
        private accountService: AccountService,
        private employeeService: EmployeeService,
        private alertService: AlertService,
        private workflowService: WorkflowService
    ) {}

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];
        const userId = this.route.snapshot.queryParams['userId'];
        
        this.form = this.formBuilder.group({
            accountId: [userId || null, Validators.required],
            type: ['Equipment', Validators.required],
            title: ['Request for items'],
            description: [''],
            status: ['Pending'],
            items: this.formBuilder.array([])
        });
        
        // Add two empty items by default
        this.addItem();
        this.addItem();
        
        // Load employees and accounts simultaneously
        this.loading = true;
        
        // Load employees for numeric IDs
        this.employeeService.getAll()
            .pipe(first())
            .subscribe({
                next: (employees) => {
                    this.employees = employees;
                    this.loadAccounts(userId);
                },
                error: (error) => {
                    this.alertService.error('Error loading employees: ' + error);
                    console.error('Error loading employees:', error);
                    this.loading = false;
                }
            });
    }
    
    loadAccounts(userId: string | null) {
        this.accountService.getAll()
            .pipe(first())
            .subscribe({
                next: (accounts) => {
                    // Match accounts with employee data for correct IDs
                    this.accounts = accounts.map(account => {
                        // Find employee match (if any)
                        const matchingEmployee = this.employees.find(
                            emp => emp.accountId === account.id
                        );
                        
                        return {
                            ...account,
                            // Use employee ID from employee record if exists, otherwise use account ID
                            employeeId: matchingEmployee ? 
                                matchingEmployee.id : 
                                account.id.toString(),
                            // Ensure firstName and lastName exist with fallbacks
                            firstName: account.firstName || '',
                            lastName: account.lastName || ''
                        };
                    });
                    
                    // If a userId was provided in query params, check if it's a valid account
                    if (userId && !this.id) {
                        const userExists = this.accounts.some(account => account.id === userId);
                        if (userExists) {
                            // Pre-select the user
                            this.form.patchValue({ accountId: userId });
                            // Disable the field if the user is a normal user (not an admin)
                            const currentUser = this.accountService.accountValue;
                            if (currentUser && currentUser.role !== 'Admin') {
                                this.form.get('accountId')?.disable();
                            }
                        }
                    }
                    
                    // If we're in edit mode, load the existing request
                    if (this.id) {
                        this.loadExistingRequest();
                    } else {
                        this.loading = false;
                    }
                },
                error: (error) => {
                    this.alertService.error('Error loading accounts: ' + error);
                    console.error('Error loading accounts:', error);
                    this.loading = false;
                }
            });
    }
    
    loadExistingRequest() {
        // edit mode
        this.requestService.getById(this.id!)
            .pipe(first())
            .subscribe({
                next: (x) => {
                    console.log('Loaded request:', x);
                    // Store the original status to check if it was changed during save
                    this.originalStatus = x.status;
                    
                    this.form.patchValue({
                        accountId: x.account?.id,
                        type: x.type,
                        title: x.title,
                        description: x.description,
                        status: x.status
                    });
                    
                    // Clear existing items and add from the response
                    this.itemsArray.clear();
                    if (x.items && x.items.length) {
                        x.items.forEach(item => {
                            this.itemsArray.push(this.createItem(item));
                        });
                    }
                    
                    this.loading = false;
                },
                error: (error) => {
                    this.alertService.error(error);
                    console.error('Error loading request:', error);
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
            description: [item.description || ''],
            quantity: [item.quantity || 1, [Validators.required, Validators.min(1)]],
            status: [item.status || 'Pending']
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
        
        // get user id for createdBy/updatedBy
        const currentUser = this.accountService.accountValue;
        const userId = currentUser?.id;
        
        // Prepare form data including disabled fields
        const formData = {...this.form.getRawValue()};
        
        // Convert accountId to number if it's a string
        if (formData.accountId && typeof formData.accountId === 'string') {
            formData.accountId = parseInt(formData.accountId, 10);
        }
        
        const saveRequest = () => {
            // create or update request based on id param
            const request = this.id
                ? this.requestService.update(this.id, { ...formData, updatedBy: userId })
                : this.requestService.create({ ...formData, createdBy: userId });
                
            request.pipe(first())
                .subscribe({
                    next: () => {
                        this.alertService.success('Request saved', { keepAfterRouteChange: true });
                        this.router.navigateByUrl('/admin/requests');
                    },
                    error: error => {
                        this.alertService.error(error);
                        console.error('Error saving request:', error);
                        this.submitting = false;
                    }
                });
        };
        
        // Check if a workflow action needs to be created when the status changes
        if (this.id && this.originalStatus && formData.status !== this.originalStatus) {
            this.workflowService.create({
                type: 'Status Change',
                title: `Request status changed`,
                description: `Status changed from ${this.originalStatus} to ${formData.status} for Request #${this.id}`,
                employeeId: formData.accountId,
                status: 'Completed',
                createdBy: userId
            })
            .pipe(first())
            .subscribe({
                next: () => saveRequest(),
                error: error => {
                    console.error('Error creating workflow record:', error);
                    // Still save the request even if workflow creation fails
                    saveRequest();
                }
            });
        } else {
            saveRequest();
        }
    }
} 