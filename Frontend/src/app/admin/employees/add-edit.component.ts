import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { first } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

import { EmployeeService, AccountService, AlertService, DepartmentService } from '@app/_services';
import { Account, Department } from '@app/_models';

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
    title!: string;
    loading = false;
    submitting = false;
    submitted = false;
    accounts: Account[] = [];
    departments: Department[] = [];
    statuses = ['Active', 'Inactive', 'On Leave', 'Terminated'];

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private employeeService: EmployeeService,
        private accountService: AccountService,
        private departmentService: DepartmentService,
        private alertService: AlertService
    ) {}

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];
        
        this.form = this.formBuilder.group({
            employeeId: [''],
            accountId: [null],
            departmentId: [null],
            position: ['', Validators.required],
            hireDate: [new Date().toISOString().split('T')[0], Validators.required],
            status: ['Active', Validators.required]
        });
        
        this.title = 'Add Employee';
        
        if (this.id) {
            // edit mode
            this.title = 'Edit Employee';
            this.loading = true;
            this.employeeService.getById(this.id)
                .pipe(first())
                .subscribe({
                    next: (x) => {
                        console.log('Loaded employee:', x);
                        this.form.patchValue(x);
                        this.loading = false;
                    },
                    error: (error) => {
                        console.error('Error loading employee:', error);
                        this.alertService.error(error);
                        this.loading = false;
                    }
                });
        }
        
        // load accounts and departments
        this.accountService.getAll()
            .pipe(first())
            .subscribe({
                next: (accounts) => {
                    this.accounts = accounts;
                    console.log('Loaded accounts:', accounts);
                },
                error: (error) => {
                    console.error('Error loading accounts:', error);
                    this.alertService.error('Error loading accounts');
                }
            });
            
        this.departmentService.getAll()
            .pipe(first())
            .subscribe({
                next: (departments) => {
                    this.departments = departments;
                    console.log('Loaded departments:', departments);
                },
                error: (error) => {
                    console.error('Error loading departments:', error);
                    this.alertService.error('Error loading departments');
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
            console.log('Form is invalid:', this.form.errors);
            console.log('Form value:', this.form.value);
            
            // Check each form control for errors
            Object.keys(this.form.controls).forEach(key => {
                const control = this.form.get(key);
                if (control && control.errors) {
                    console.log(`Control ${key} has errors:`, control.errors);
                }
            });
            
            return;
        }
        
        this.submitting = true;
        
        // get user id for createdBy/updatedBy
        const currentUser = this.accountService.accountValue;
        const userId = currentUser?.id;
        console.log('Current user:', currentUser);
        
        // Prepare form data
        const formData = { ...this.form.value };
        
        // Convert accountId and departmentId to number if they're strings
        if (formData.accountId && typeof formData.accountId === 'string') {
            formData.accountId = parseInt(formData.accountId, 10);
        }
        
        if (formData.departmentId && typeof formData.departmentId === 'string') {
            formData.departmentId = parseInt(formData.departmentId, 10);
        }
        
        console.log('Submitting employee data:', formData);
        
        const saveEmployee = () => {
            // create or update employee based on id param
            return this.id
                ? this.employeeService.update(this.id, { ...formData, updatedBy: userId })
                : this.employeeService.create({ ...formData, createdBy: userId });
        };
        
        saveEmployee()
            .pipe(first())
            .subscribe({
                next: (response) => {
                    console.log('Employee saved successfully:', response);
                    this.alertService.success('Employee saved', { keepAfterRouteChange: true });
                    this.router.navigateByUrl('/admin/employees');
                },
                error: error => {
                    console.error('Error saving employee:', error);
                    if (error.error && error.error.message) {
                        console.error('Server error message:', error.error.message);
                    }
                    this.alertService.error(error);
                    this.submitting = false;
                }
            });
    }
} 