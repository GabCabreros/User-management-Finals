import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { first } from 'rxjs/operators';

import { WorkflowService, EmployeeService, AlertService } from '@app/_services';
import { Workflow, Employee } from '@app/_models';

@Component({ 
    templateUrl: 'workflow.component.html',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule
    ]
})
export class WorkflowComponent implements OnInit, OnDestroy {
    id!: string;
    employee?: Employee;
    workflows: Workflow[] = [];
    loading = false;
    
    // Pagination
    itemsPerPage = 10;
    currentPage = 1;
    totalPages = 1;
    Math = Math; // For use in template
    
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private workflowService: WorkflowService,
        private employeeService: EmployeeService,
        private alertService: AlertService
    ) {}

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];
        
        // Load the employee details
        this.loading = true;
        this.employeeService.getById(this.id)
            .pipe(first())
            .subscribe({
                next: employee => {
                    this.employee = employee;
                    this.loadWorkflows();
                },
                error: error => {
                    this.alertService.error('Error loading employee: ' + error);
                    this.loading = false;
                    this.router.navigate(['/admin/employees']);
                }
            });
    }
    
    ngOnDestroy() {
        // Cleanup
    }
    
    loadWorkflows() {
        this.workflowService.getByEmployeeId(this.id)
            .pipe(first())
            .subscribe({
                next: workflows => {
                    this.workflows = this.processWorkflows(workflows);
                    
                    // Calculate total pages for pagination
                    this.totalPages = Math.ceil(this.workflows.length / this.itemsPerPage);
                    this.currentPage = 1; // Reset to first page
                    
                    this.loading = false;
                },
                error: error => {
                    this.alertService.error('Error loading workflows: ' + error);
                    this.loading = false;
                }
            });
    }
    
    // Get the current page of workflows
    get paginatedWorkflows() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        return this.workflows.slice(startIndex, startIndex + this.itemsPerPage);
    }
    
    // Change page
    setPage(page: number) {
        if (page < 1 || page > this.totalPages) {
            return;
        }
        this.currentPage = page;
    }
    
    // Generate page numbers array for pagination
    get pageNumbers(): number[] {
        const pages = [];
        for (let i = 1; i <= this.totalPages; i++) {
            pages.push(i);
        }
        return pages;
    }
    
    // Determine if a workflow represents a status change for a request
    isStatusChange(workflow: Workflow): boolean {
        return workflow.type === 'Request' 
            && workflow.previousValue 
            && workflow.newValue 
            && this.isStatusValue(workflow.previousValue) 
            && this.isStatusValue(workflow.newValue);
    }
    
    // Helper to determine if a string represents a status
    private isStatusValue(value: string): boolean {
        const statusValues = ['pending', 'approved', 'rejected', 'completed', 'in progress', 'waiting', 'on hold'];
        return statusValues.some(status => value.toLowerCase().includes(status));
    }
    
    // Get appropriate badge class for a status
    getStatusBadgeClass(status: string): string {
        const statusLower = status.toLowerCase();
        
        if (statusLower.includes('approved') || statusLower.includes('completed')) {
            return 'bg-success';
        }
        
        if (statusLower.includes('rejected') || statusLower.includes('denied')) {
            return 'bg-danger';
        }
        
        if (statusLower.includes('progress') || statusLower.includes('processing')) {
            return 'bg-info';
        }
        
        if (statusLower.includes('pending') || statusLower.includes('waiting')) {
            return 'bg-warning';
        }
        
        return 'bg-secondary';
    }
    
    // Get appropriate icon for a status
    getStatusIcon(status: string): string {
        const statusLower = status.toLowerCase();
        
        if (statusLower.includes('approved') || statusLower.includes('completed')) {
            return 'fas fa-check-circle';
        }
        
        if (statusLower.includes('rejected') || statusLower.includes('denied')) {
            return 'fas fa-times-circle';
        }
        
        if (statusLower.includes('progress') || statusLower.includes('processing')) {
            return 'fas fa-spinner fa-spin';
        }
        
        if (statusLower.includes('pending') || statusLower.includes('waiting')) {
            return 'fas fa-clock';
        }
        
        return 'fas fa-info-circle';
    }
    
    // Process workflows to make them display-ready
    private processWorkflows(workflows: Workflow[]): Workflow[] {
        return workflows
            .map(workflow => {
                const processedWorkflow = { ...workflow };
                
                // Set appropriate icon and color based on workflow type and status
                processedWorkflow.iconClass = this.getIconClass(workflow);
                processedWorkflow.statusClass = this.getStatusClass(workflow);
                
                // Generate readable description if not already provided
                if (!processedWorkflow.description || processedWorkflow.description.trim() === '') {
                    processedWorkflow.description = this.generateDescription(workflow);
                }
                
                // For request status changes, make sure the displayed status is the new value
                if (workflow.type === 'Request' && workflow.previousValue && workflow.newValue) {
                    processedWorkflow.displayStatus = workflow.newValue;
                } else {
                    processedWorkflow.displayStatus = workflow.status;
                }
                
                // Create display-friendly date
                if (workflow.created) {
                    processedWorkflow.displayDate = new Date(workflow.created).toLocaleString();
                }
                
                return processedWorkflow;
            })
            // Sort by date, newest first
            .sort((a, b) => {
                const dateA = a.created ? new Date(a.created).getTime() : 0;
                const dateB = b.created ? new Date(b.created).getTime() : 0;
                return dateB - dateA;
            });
    }

    // Generate a readable description if not already provided
    private generateDescription(workflow: Workflow): string {
        let description = '';
        
        switch (workflow.type) {
            case 'Onboarding':
                description = `Employee onboarding process ${workflow.status.toLowerCase()}`;
                break;
            case 'Department Transfer':
                if (workflow.previousValue && workflow.newValue) {
                    description = `Employee transferred from ${workflow.previousValue} to ${workflow.newValue}`;
                } else {
                    description = 'Employee transferred to a new department';
                }
                break;
            case 'Request':
                if (workflow.previousValue && workflow.newValue) {
                    description = `Request status changed from ${workflow.previousValue} to ${workflow.newValue}`;
                } else {
                    description = `Request ${workflow.status.toLowerCase()}`;
                }
                break;
            default:
                description = `${workflow.type} ${workflow.status.toLowerCase()}`;
        }
        
        return description;
    }
    
    // Get appropriate icon class based on workflow type
    private getIconClass(workflow: Workflow): string {
        switch (workflow.type) {
            case 'Onboarding':
                return 'fa-user-plus';
            case 'Transfer':
            case 'Department Transfer':
                return 'fa-exchange-alt';
            case 'Offboarding':
            case 'Termination':
                return 'fa-user-minus';
            case 'ProfileUpdate':
                return 'fa-user-edit';
            case 'StatusUpdate':
            case 'Status Change':
                return 'fa-toggle-on';
            case 'Request':
                return 'fa-file-alt';
            case 'AccountCreation':
                return 'fa-user-plus';
            default:
                return 'fa-info-circle';
        }
    }
    
    // Get appropriate status class based on workflow status
    private getStatusClass(workflow: Workflow): string {
        // Special handling for Request type with status changes
        if (workflow.type === 'Request' && workflow.newValue) {
            const newValue = workflow.newValue.toLowerCase();
            
            if (newValue.includes('approved')) {
                return 'bg-success';
            }
            
            if (newValue.includes('rejected')) {
                return 'bg-danger';
            }
            
            if (newValue.includes('completed')) {
                return 'bg-info';
            }
            
            if (newValue.includes('pending')) {
                return 'bg-warning';
            }
        }
        
        // Standard status coloring
        const status = workflow.status.toLowerCase();
        
        if (status.includes('approved') || status.includes('completed')) {
            return 'bg-success';
        }
        
        if (status.includes('rejected') || status.includes('terminated')) {
            return 'bg-danger';
        }
        
        if (status.includes('processing') || status.includes('progress')) {
            return 'bg-info';
        }
        
        if (status.includes('pending') || status.includes('waiting')) {
            return 'bg-warning';
        }
        
        return 'bg-secondary';
    }

    // Check if a workflow is a pending request that can be actioned
    isPendingRequest(workflow: Workflow): boolean {
        if (workflow.type !== 'Request') {
            return false;
        }
        
        const status = (workflow.displayStatus || workflow.status || '').toLowerCase();
        return status.includes('pending') || status.includes('waiting') || status.includes('submitted');
    }
    
    // Update a request status (approve/reject)
    updateRequestStatus(id: string, newStatus: 'Approved' | 'Rejected') {
        // Find the workflow in our list
        const workflow = this.workflows.find(w => w.id === id);
        if (!workflow) {
            this.alertService.error('Workflow not found');
            return;
        }
        
        // Set processing state
        workflow.isProcessing = true;
        
        // Prepare the update object
        const updateData = {
            status: newStatus,
            previousValue: workflow.status,
            newValue: newStatus
        };
        
        // Call the service to update the workflow
        this.workflowService.update(id, updateData)
            .pipe(first())
            .subscribe({
                next: () => {
                    // Update was successful
                    this.alertService.success(`Request ${newStatus.toLowerCase()} successfully`);
                    
                    // Update the workflow in our list
                    workflow.status = newStatus;
                    workflow.displayStatus = newStatus;
                    workflow.previousValue = updateData.previousValue;
                    workflow.newValue = newStatus;
                    workflow.statusClass = this.getStatusClass({ ...workflow, status: newStatus });
                    workflow.isProcessing = false;
                },
                error: error => {
                    this.alertService.error(`Error updating request: ${error}`);
                    workflow.isProcessing = false;
                }
            });
    }
} 