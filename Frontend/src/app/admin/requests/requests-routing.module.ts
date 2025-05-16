import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListComponent as RequestsListComponent } from './list.component';
import { DetailsComponent as RequestsDetailsComponent } from './details.component';
import { AddEditComponent as RequestsAddEditComponent } from './add-edit.component';

const routes: Routes = [
    { path: '', component: RequestsListComponent },
    { path: 'add', component: RequestsAddEditComponent },
    { path: 'edit/:id', component: RequestsAddEditComponent },
    { path: 'details/:id', component: RequestsDetailsComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class RequestsRoutingModule { } 