import { Employee } from './employee';

export class Department {
    id: string = '';
    name: string = '';
    description: string = '';
    employees?: Employee[];
    created?: Date;
    updated?: Date;
    isDeleting?: boolean;
} 