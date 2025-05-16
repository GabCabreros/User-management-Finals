import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { first } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

import { EmployeeService, AccountService, AlertService, DepartmentService } from '@app/_services';
import { Employee, Department } from '@app/_models';

@Component({ 
    templateUrl: 'transfer.component.html',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule
    ]
})
export class TransferComponent implements OnInit {
    form!: FormGroup;
    id!: string;
    employee?: Employee;
    departments: Department[] = [];
    loading = false;
    submitting = false;
    submitted = false;

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
            departmentId: ['', Validators.required]
        });
        
        // load employee and departments
        this.loading = true;
        this.employeeService.getById(this.id)
            .pipe(first())
            .subscribe({
                next: employee => {
                    this.employee = employee;
                    this.loading = false;
                },
                error: error => {
                    console.error('Error loading employee:', error);
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
            
        this.departmentService.getAll()
            .pipe(first())
            .subscribe({
                next: departments => this.departments = departments,
                error: error => {
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
            return;
        }
        
        this.submitting = true;
        
        // get user id for updatedBy
        const currentUser = this.accountService.accountValue;
        const userId = currentUser?.id;
        
        this.employeeService.transferDepartment(this.id, this.form.value.departmentId, userId)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Employee transferred successfully', { keepAfterRouteChange: true });
                    this.router.navigateByUrl('/admin/employees');
                },
                error: error => {
                    this.alertService.error(error);
                    this.submitting = false;
                }
            });
    }
} 