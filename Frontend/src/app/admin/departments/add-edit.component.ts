import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { first } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

import { DepartmentService, AlertService, AccountService, WorkflowService } from '@app/_services';

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

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private departmentService: DepartmentService,
        private alertService: AlertService,
        private accountService: AccountService,
        private workflowService: WorkflowService
    ) {}

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];
        
        this.form = this.formBuilder.group({
            name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
            description: ['']
        });
        
        this.title = 'Add Department';
        
        if (this.id) {
            // edit mode
            this.title = 'Edit Department';
            this.loading = true;
            this.departmentService.getById(this.id)
                .pipe(first())
                .subscribe({
                    next: department => {
                        this.form.patchValue(department);
                        this.loading = false;
                    },
                    error: error => {
                        this.alertService.error(error);
                        this.loading = false;
                        this.router.navigateByUrl('/admin/departments');
                    }
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
        
        // Get current user for the workflow entry
        const currentUser = this.accountService.accountValue;
        const userId = currentUser?.id;
        
        // Create department save observable
        const saveDepartment = () => {
            return this.id
                ? this.departmentService.update(this.id, this.form.value)
                : this.departmentService.create(this.form.value);
        };
        
        saveDepartment()
            .pipe(first())
            .subscribe({
                next: department => {
                    // Create a workflow entry for the department action
                    const action = this.id ? 'updated' : 'created';
                    const departmentName = this.form.value.name;
                    
                    // Only log workflow if we have a userId (logged in)
                    if (userId) {
                        // Find any employee record linked to the current user
                        // This is required because workflows are linked to employees
                        this.workflowService.getAll()
                            .pipe(first())
                            .subscribe({
                                next: workflows => {
                                    // Look for any workflow related to the current user
                                    const userWorkflow = workflows.find(w => 
                                        w.employee?.account?.id === userId
                                    );
                                    
                                    if (userWorkflow?.employee?.id) {
                                        // Create workflow entry
                                        const workflowData = {
                                            employeeId: userWorkflow.employee.id,
                                            type: 'Department Transfer', // Using this type since it's related to departments
                                            description: `Department "${departmentName}" ${action}`,
                                            status: 'Completed',
                                            previousValue: this.id ? 'Updated Department' : 'New Department',
                                            newValue: departmentName,
                                            createdBy: userId,
                                            updatedBy: userId
                                        };
                                        
                                        this.workflowService.create(workflowData)
                                            .pipe(first())
                                            .subscribe({
                                                next: () => {
                                                    // Success message is shown below even if workflow fails
                                                },
                                                error: error => {
                                                    console.error('Error creating workflow:', error);
                                                }
                                            });
                                    }
                                },
                                error: error => {
                                    console.error('Error finding employee:', error);
                                }
                            });
                    }
                    
                    const message = `Department ${action} successfully`;
                    this.alertService.success(message, { keepAfterRouteChange: true });
                    this.router.navigateByUrl('/admin/departments');
                },
                error: error => {
                    this.alertService.error(error);
                    this.submitting = false;
                }
            });
    }
} 