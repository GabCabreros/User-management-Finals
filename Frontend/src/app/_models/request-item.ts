export class RequestItem {
    id?: string;
    name: string = '';
    description: string = '';
    quantity: number = 1;
    status: string = 'Pending';
    created?: Date;
    updated?: Date;
} 