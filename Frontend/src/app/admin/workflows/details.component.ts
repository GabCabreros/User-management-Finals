import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { first } from 'rxjs/operators';
import { interval, Subscription } from 'rxjs';

import { WorkflowService, AlertService, AccountService } from '@app/_services';
import { Workflow } from '@app/_models';

@Component({ 
    templateUrl: 'details.component.html',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule
    ]
})
export class DetailsComponent implements OnInit, OnDestroy {
    id!: string;
    workflow?: Workflow;
    loading = false;
    isProcessing = false; // Flag for action button processing state
    private pollingSubscription: Subscription | null = null;
    public pollingInterval = 5000; // 5 seconds polling interval - faster updates

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private workflowService: WorkflowService,
        private alertService: AlertService,
        private accountService: AccountService
    ) {}

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];
        this.loading = true;
        this.loadWorkflowDetails();
        
        // Set up polling for real-time updates
        this.startPolling();
    }
    
    ngOnDestroy() {
        // Clean up subscription when component is destroyed
        this.stopPolling();
    }
    
    // Start polling for updates
    private startPolling() {
        // Cancel any existing subscription
        this.stopPolling();
        
        // Set up new polling subscription
        this.pollingSubscription = interval(this.pollingInterval)
            .subscribe(() => {
                this.loadWorkflowDetails(false); // Silent refresh (no UI notification)
            });
    }
    
    // Stop polling
    private stopPolling() {
        if (this.pollingSubscription) {
            this.pollingSubscription.unsubscribe();
            this.pollingSubscription = null;
        }
    }
    
    // Force a manual refresh with notification
    refreshDetails() {
        this.loadWorkflowDetails(true);
        this.alertService.info('Refreshing workflow details...', { autoClose: true });
    }

    loadWorkflowDetails(showLoading = true) {
        if (showLoading) {
            this.loading = true;
        }
        
        this.workflowService.getById(this.id)
            .pipe(first())
            .subscribe({
                next: workflow => {
                    // Process the workflow to add UI helper properties
                    this.workflow = this.processWorkflow(workflow);
                    this.loading = false;
                },
                error: error => {
                    this.alertService.error('Error loading workflow details: ' + error);
                    this.loading = false;
                    this.router.navigate(['/admin/workflows']);
                }
            });
    }

    // Process a single workflow to add UI helper properties
    private processWorkflow(workflow: Workflow): Workflow {
        const processedWorkflow = { ...workflow };
        
        // Set icon class based on type
        processedWorkflow.iconClass = this.getIconClass(workflow);
        
        // Set status class based on status or newValue
        processedWorkflow.statusClass = this.getStatusClass(workflow);
        
        // Generate a readable description if not already set
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
    }
    
    // Generate human-readable description
    private generateDescription(workflow: Workflow): string {
        const name = workflow.employee?.account ? 
            `${workflow.employee?.account?.firstName} ${workflow.employee?.account?.lastName}` : 
            'Unknown Employee';
        
        switch (workflow.type) {
            case 'AccountCreation':
                return `Admin created new account for ${name}`;
                
            case 'ProfileUpdate':
                if (workflow.previousValue && workflow.newValue) {
                    return `${name}'s profile was updated: changed ${workflow.previousValue} to ${workflow.newValue}`;
                }
                return `${name}'s profile information was updated`;
                
            case 'StatusUpdate':
                if (workflow.previousValue && workflow.newValue) {
                    return `${name}'s status changed from "${workflow.previousValue}" to "${workflow.newValue}"`;
                }
                return `${name}'s status was updated`;
                
            case 'Onboarding':
                return `Started onboarding process for ${name}`;
                
            case 'Department Transfer':
                if (workflow.previousValue && workflow.newValue) {
                    return `${name} was transferred from department "${workflow.previousValue}" to "${workflow.newValue}"`;
                }
                return `${name} was transferred to a new department`;
                
            case 'Transfer':
                if (workflow.previousValue && workflow.newValue) {
                    return `${name} transferred from "${workflow.previousValue}" to "${workflow.newValue}"`;
                }
                return `${name} was transferred`;
                
            case 'Status Change':
                if (workflow.previousValue && workflow.newValue) {
                    return `${name}'s employee status changed from "${workflow.previousValue}" to "${workflow.newValue}"`;
                }
                return `${name}'s employee status was updated`;
                
            case 'Offboarding':
            case 'Termination':
                if (workflow.previousValue && workflow.newValue) {
                    return `${name}'s employment ended: ${workflow.newValue}`;
                }
                return `Offboarding process started for ${name}`;
                
            case 'Request':
                if (workflow.previousValue && workflow.newValue) {
                    const newValue = workflow.newValue.toLowerCase();
                    if (newValue.includes('approved')) {
                        return `Request for ${name} was APPROVED: "${workflow.previousValue}" → "${workflow.newValue}"`;
                    } else if (newValue.includes('rejected')) {
                        return `Request for ${name} was REJECTED: "${workflow.previousValue}" → "${workflow.newValue}"`;
                    } else if (newValue.includes('completed')) {
                        return `Request for ${name} was COMPLETED: "${workflow.previousValue}" → "${workflow.newValue}"`;
                    } else {
                        return `Request status changed from "${workflow.previousValue}" to "${workflow.newValue}" for ${name}`;
                    }
                }
                return `New request created by ${name}`;
                
            case 'DepartmentCreation':
                return `${name} created a new department: "${workflow.newValue}"`;
                
            case 'DepartmentUpdate':
                if (workflow.previousValue && workflow.newValue) {
                    return `${name} updated department from "${workflow.previousValue}" to "${workflow.newValue}"`;
                }
                return `${name} updated department information`;
                
            case 'DepartmentDeletion':
                return `${name} deleted department: "${workflow.previousValue}"`;
                
            default:
                if (workflow.previousValue && workflow.newValue) {
                    return `${workflow.type}: Changed from "${workflow.previousValue}" to "${workflow.newValue}" for ${name}`;
                }
                return `${workflow.type} activity for ${name}`;
        }
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
            case 'DepartmentCreation':
                return 'fa-plus-circle';
            case 'DepartmentUpdate':
                return 'fa-edit';
            case 'DepartmentDeletion':
                return 'fa-trash-alt';
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
            
            if (newValue.includes('completed') && !newValue.includes('approved')) {
                return 'bg-info';
            }
            
            if (newValue.includes('pending') || newValue.includes('waiting')) {
                return 'bg-warning';
            }
        }
        
        // First check for status changes via newValue
        if (workflow.newValue) {
            const statusValue = workflow.newValue.toLowerCase();
            
            if (statusValue.includes('approved') || 
                statusValue.includes('completed') || 
                statusValue.includes('active') || 
                statusValue.includes('success')) {
                return 'bg-success';
            }
            
            if (statusValue.includes('rejected') || 
                statusValue.includes('terminated') || 
                statusValue.includes('inactive') || 
                statusValue.includes('error') ||
                statusValue.includes('failed')) {
                return 'bg-danger';
            }
            
            if (statusValue.includes('progress') || 
                statusValue.includes('processing') || 
                statusValue.includes('started')) {
                return 'bg-info';
            }
            
            if (statusValue.includes('pending') || 
                statusValue.includes('waiting') || 
                statusValue.includes('hold')) {
                return 'bg-warning';
            }
        }
        
        // Then check workflow status
        const status = workflow.status.toLowerCase();
        
        if (status.includes('approved') || 
            status.includes('completed') || 
            status.includes('active') || 
            status.includes('success')) {
            return 'bg-success';
        }
        
        if (status.includes('rejected') || 
            status.includes('terminated') || 
            status.includes('inactive') || 
            status.includes('error') ||
            status.includes('failed')) {
            return 'bg-danger';
        }
        
        if (status.includes('progress') || 
            status.includes('processing') || 
            status.includes('started')) {
            return 'bg-info';
        }
        
        if (status.includes('pending') || 
            status.includes('waiting') || 
            status.includes('hold')) {
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
    updateRequestStatus(newStatus: 'Approved' | 'Rejected') {
        if (!this.workflow) {
            this.alertService.error('No workflow loaded');
            return;
        }
        
        // Get current user
        const currentUser = this.accountService.accountValue;
        if (!currentUser || !currentUser.id) {
            this.alertService.error('You must be logged in to perform this action');
            return;
        }
        
        // Set processing state
        this.isProcessing = true;
        
        // Prepare the update object
        const updateData = {
            status: newStatus,
            previousValue: this.workflow.status,
            newValue: newStatus,
            updatedBy: currentUser.id // Add the updatedBy field with the current user's ID
        };
        
        // Call the service to update the workflow
        this.workflowService.update(this.id, updateData)
            .pipe(first())
            .subscribe({
                next: () => {
                    // Update was successful
                    this.alertService.success(`Request ${newStatus.toLowerCase()} successfully`);
                    
                    // Refresh the workflow details
                    this.loadWorkflowDetails();
                    
                    // Clear processing state
                    this.isProcessing = false;
                },
                error: error => {
                    this.alertService.error(`Error updating request: ${error}`);
                    this.isProcessing = false;
                }
            });
    }
} 