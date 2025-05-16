import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { DepartmentService, AlertService } from '@app/_services';
import { Department } from '@app/_models';

@Component({ 
    templateUrl: 'list.component.html',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule
    ]
})
export class ListComponent implements OnInit {
    departments: Department[] = [];
    loading = false;

    constructor(
        private departmentService: DepartmentService,
        private alertService: AlertService
    ) {}

    ngOnInit() {
        this.loading = true;
        this.loadDepartments();
    }

    loadDepartments() {
        this.departmentService.getAll()
            .pipe(first())
            .subscribe({
                next: departments => {
                    this.departments = departments;
                    this.loading = false;
                },
                error: error => {
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
    }

    deleteDepartment(id: string) {
        const department = this.departments.find(x => x.id === id);
        if (!department) return;
        
        if (department.employees && department.employees.length > 0) {
            this.alertService.error(`Cannot delete department "${department.name}" because it has employees assigned.`);
            return;
        }
        
        if (confirm(`Are you sure you want to delete department "${department.name}"?`)) {
            department.isDeleting = true;
            this.departmentService.delete(id)
                .pipe(first())
                .subscribe({
                    next: () => {
                        this.departments = this.departments.filter(x => x.id !== id);
                        this.alertService.success('Department deleted successfully');
                    },
                    error: error => {
                        this.alertService.error(error);
                        department.isDeleting = false;
                    }
                });
        }
    }
} 