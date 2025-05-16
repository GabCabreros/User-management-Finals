import { Account } from './account';
import { Department } from './department';

export class Employee {
    id: string = '';
    employeeId: string = '';
    position: string = '';
    hireDate: Date = new Date();
    status: string = 'Active';
    account?: Account;
    department?: Department;
    created?: Date;
    updated?: Date;
    isDeleting?: boolean;
} 