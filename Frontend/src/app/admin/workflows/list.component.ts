import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { first } from 'rxjs/operators';
import { interval, Subscription } from 'rxjs';

import { WorkflowService, EmployeeService, AlertService } from '@app/_services';
import { Workflow, Employee } from '@app/_models';

@Component({ 
    templateUrl: 'list.component.html',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule
    ]
})
export class ListComponent implements OnInit, OnDestroy {
    workflows: Workflow[] = [];
    filteredWorkflows: Workflow[] = [];
    employees: any[] = [];
    loading = false;
    private pollingSubscription: Subscription | null = null;
    public pollingInterval = 30000; // 30 seconds polling interval
    
    // Filter options
    filterForm!: FormGroup;
    showFilters = false;
    uniqueTypes: string[] = [];
    
    // View options
    viewMode: 'table' | 'timeline' = 'table';
    
    // Pagination
    itemsPerPage = 10;
    currentPage = 1;
    totalPages = 1;
    Math = Math; // For use in template
    
    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private workflowService: WorkflowService,
        private employeeService: EmployeeService,
        private alertService: AlertService,
        private formBuilder: FormBuilder
    ) {}

    ngOnInit() {
        // Initialize filter form
        this.filterForm = this.formBuilder.group({
            type: [''],
            status: [''],
            employeeId: [''],
            dateRange: ['']
        });
        
        // Listen for filter changes
        this.filterForm.valueChanges.subscribe(() => {
            this.applyFilters();
        });
        
        // Load employees for filter dropdown
        this.employeeService.getAll()
            .pipe(first())
            .subscribe({
                next: (employees) => {
                    this.employees = employees;
                    this.loadAllWorkflows();
                },
                error: (error) => {
                    console.error('Error loading employees:', error);
                    this.loadAllWorkflows();
                }
            });
            
        // Start polling for updates
        this.startPolling();
    }
    
    ngOnDestroy() {
        // Clean up subscription on component destroy
        this.stopPolling();
    }
    
    toggleFilters() {
        this.showFilters = !this.showFilters;
    }
    
    setViewMode(mode: 'table' | 'timeline') {
        this.viewMode = mode;
    }
    
    // Load all workflows from the server
    private loadAllWorkflows(showLoading = true) {
        if (showLoading) {
            this.loading = true;
        }
        
        this.workflowService.getAll()
            .pipe(first())
            .subscribe({
                next: (workflows) => {
                    // Process and sort workflows
                    this.workflows = this.processWorkflows(workflows);
                    
                    // Extract unique types for filter dropdown
                    this.uniqueTypes = Array.from(new Set(this.workflows.map(w => w.type)));
                    
                    // Apply filters (or show all if no filters)
                    this.applyFilters();
                    this.loading = false;
                },
                error: (error) => {
                    this.alertService.error('Error loading system activities: ' + error);
                    this.loading = false;
                }
            });
    }
    
    applyFilters() {
        const filters = this.filterForm.value;
        
        this.filteredWorkflows = this.workflows.filter(workflow => {
            // Type filter
            if (filters.type && workflow.type !== filters.type) {
                return false;
            }
            
            // Status filter
            if (filters.status) {
                const status = (workflow.status || '').toLowerCase();
                const displayStatus = (workflow.displayStatus || '').toLowerCase();
                if (!status.includes(filters.status.toLowerCase()) && 
                    !displayStatus.includes(filters.status.toLowerCase())) {
                    return false;
                }
            }
            
            // Employee filter
            if (filters.employeeId && workflow.employee) {
                if (workflow.employee.id !== filters.employeeId) {
                    return false;
                }
            }
            
            // Date range filter
            if (filters.dateRange) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                const createdDate = workflow.created ? new Date(workflow.created) : null;
                
                if (createdDate) {
                    if (filters.dateRange === 'today') {
                        const tomorrow = new Date(today);
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        if (createdDate < today || createdDate >= tomorrow) {
                            return false;
                        }
                    } else if (filters.dateRange === 'yesterday') {
                        const yesterday = new Date(today);
                        yesterday.setDate(yesterday.getDate() - 1);
                        if (createdDate < yesterday || createdDate >= today) {
                            return false;
                        }
                    } else if (filters.dateRange === 'week') {
                        const weekAgo = new Date(today);
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        if (createdDate < weekAgo) {
                            return false;
                        }
                    } else if (filters.dateRange === 'month') {
                        const monthAgo = new Date(today);
                        monthAgo.setDate(monthAgo.getDate() - 30);
                        if (createdDate < monthAgo) {
                            return false;
                        }
                    }
                }
            }
            
            return true;
        });
        
        // Calculate total pages for pagination
        this.totalPages = Math.ceil(this.filteredWorkflows.length / this.itemsPerPage);
        this.currentPage = 1; // Reset to first page when filters change
    }
    
    clearFilters() {
        this.filterForm.reset({
            type: '',
            status: '',
            employeeId: '',
            dateRange: ''
        });
        this.applyFilters();
    }
    
    // Get current page of workflows for pagination
    get paginatedWorkflows(): Workflow[] {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        return this.filteredWorkflows.slice(startIndex, startIndex + this.itemsPerPage);
    }
    
    // Set current page
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
    
    // Manual refresh button handler
    refreshList() {
        this.loadAllWorkflows(true);
    }
    
    // Start automatic polling for updates
    private startPolling() {
        this.pollingSubscription = interval(this.pollingInterval)
            .subscribe(() => {
                // Silent refresh in the background
                this.loadAllWorkflows(false);
            });
    }
    
    // Stop polling
    private stopPolling() {
        if (this.pollingSubscription) {
            this.pollingSubscription.unsubscribe();
            this.pollingSubscription = null;
        }
    }
    
    // Process workflows to make them display-ready
    private processWorkflows(workflows: Workflow[]): Workflow[] {
        return workflows
            .map(workflow => {
                const processedWorkflow = { ...workflow };
                
                // Set appropriate icon and color based on workflow type and status
                processedWorkflow.iconClass = this.getIconClass(workflow);
                processedWorkflow.statusClass = this.getStatusClass(workflow);
                
                // Generate readable description
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
    updateRequestStatus(id: string, newStatus: 'Approved' | 'Rejected') {
        // Find the workflow in our list
        const workflow = this.workflows.find(w => w.id === id);
        if (!workflow) {
            this.alertService.error('Workflow not found');
            return;
        }
        
        // Add processing flag to the workflow object
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