import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListComponent as WorkflowsListComponent } from './list.component';
import { DetailsComponent as WorkflowsDetailsComponent } from './details.component';
import { AddEditComponent as WorkflowsAddEditComponent } from './add-edit.component';

const routes: Routes = [
    { path: '', component: WorkflowsListComponent },
    { path: 'add', component: WorkflowsAddEditComponent },
    { path: 'edit/:id', component: WorkflowsAddEditComponent },
    { path: 'details/:id', component: WorkflowsDetailsComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class WorkflowsRoutingModule { } 