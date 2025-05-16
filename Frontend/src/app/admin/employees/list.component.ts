import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { RouterModule } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';

import { EmployeeService } from '@app/_services';
import { Employee } from '@app/_models';

@Component({ 
    templateUrl: 'list.component.html',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule
    ]
})
export class ListComponent implements OnInit {
    employees: Employee[] = [];

    constructor(private employeeService: EmployeeService) {}

    ngOnInit() {
        this.employeeService.getAll()
            .pipe(first())
            .subscribe({
                next: employees => this.employees = employees,
                error: error => console.error('Error loading employees:', error)
            });
    }

    deleteEmployee(id: string) {
        const employee = this.employees.find(x => x.id === id);
        if (!employee) return;
        employee.isDeleting = true;
        this.employeeService.delete(id)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.employees = this.employees.filter(x => x.id !== id);
                },
                error: error => console.error('Error deleting employee:', error)
            });
    }
} 