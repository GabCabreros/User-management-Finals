import { Account } from './account';
import { RequestItem } from './request-item';

export class RequestModel {
    id: string = '';
    type: string = '';
    title: string = '';
    description: string = '';
    status: string = 'Pending';
    account?: Account;
    items?: RequestItem[];
    created?: Date;
    updated?: Date;
    isDeleting?: boolean;
} 