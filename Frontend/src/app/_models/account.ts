import { Role } from './role';

export class Account {
    id: string = '';
    title: string = '';
    firstName: string = '';
    lastName: string = '';
    email: string = '';
    role: Role = Role.User;
    status: string = 'Active';
    jwtToken?: string;
    isDeleting?: boolean;
    
    // Helper method to check if account is active
    get isActive(): boolean {
        return this.status === 'Active';
    }
}
