import { Employee } from './employee';

export class Workflow {
    id: string = '';
    type: string = '';
    description: string = '';
    status: string = 'Pending';
    previousValue?: string;
    newValue?: string;
    employee?: Employee;
    created?: Date;
    updated?: Date;
    isDeleting?: boolean;
    isProcessing?: boolean; // Flag to indicate when a request is being processed
    
    // UI helper properties (not from the API)
    iconClass?: string;
    statusClass?: string;
    displayStatus?: string;
    displayDate?: string;
} 