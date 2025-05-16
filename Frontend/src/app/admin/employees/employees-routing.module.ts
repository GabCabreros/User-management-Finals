import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListComponent as EmployeesListComponent } from './list.component';
import { AddEditComponent as EmployeesAddEditComponent } from './add-edit.component';
import { TransferComponent as EmployeesTransferComponent } from './transfer.component';
import { WorkflowComponent as EmployeeWorkflowComponent } from './workflow.component';

const routes: Routes = [
    { path: '', component: EmployeesListComponent },
    { path: 'add', component: EmployeesAddEditComponent },
    { path: 'edit/:id', component: EmployeesAddEditComponent },
    { path: 'transfer/:id', component: EmployeesTransferComponent },
    { path: 'workflow/:id', component: EmployeeWorkflowComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EmployeesRoutingModule { } 