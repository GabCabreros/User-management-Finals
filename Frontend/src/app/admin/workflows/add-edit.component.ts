import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { WorkflowService, EmployeeService, AccountService, AlertService } from '@app/_services';
import { Employee } from '@app/_models';

@Component({ templateUrl: 'add-edit.component.html' })
export class AddEditComponent implements OnInit {
    form!: FormGroup;
    id?: string;
    title!: string;
    loading = false;
    submitting = false;
    submitted = false;
    employees: Employee[] = [];
    types = ['Onboarding', 'Department Transfer', 'Status Change', 'Termination', 'Request'];
    statuses = ['Pending', 'In Progress', 'Approved', 'Rejected', 'Completed'];

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private workflowService: WorkflowService,
        private employeeService: EmployeeService,
        private accountService: AccountService,
        private alertService: AlertService
    ) {}

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];
        
        this.form = this.formBuilder.group({
            employeeId: ['', Validators.required],
            type: ['', Validators.required],
            description: ['', Validators.required],
            status: ['Pending', Validators.required],
            previousValue: [''],
            newValue: ['']
        });
        
        this.title = 'Create Workflow';
        
        this.employeeService.getAll()
            .pipe(first())
            .subscribe(employees => this.employees = employees);
        
        if (this.id) {
            // edit mode
            this.title = 'Edit Workflow';
            this.loading = true;
            this.workflowService.getById(this.id)
                .pipe(first())
                .subscribe(x => {
                    this.form.patchValue(x);
                    this.loading = false;
                });
        }
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
        
        // get user id for createdBy/updatedBy
        const currentUser = this.accountService.accountValue;
        const userId = currentUser?.id;
        
        const saveWorkflow = () => {
            // create or update workflow based on id param
            return this.id
                ? this.workflowService.update(this.id, { ...this.form.value, updatedBy: userId })
                : this.workflowService.create({ ...this.form.value, createdBy: userId });
        };
        
        saveWorkflow()
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Workflow saved', { keepAfterRouteChange: true });
                    this.router.navigateByUrl('/admin/workflows');
                },
                error: error => {
                    this.alertService.error(error);
                    this.submitting = false;
                }
            });
    }
} 