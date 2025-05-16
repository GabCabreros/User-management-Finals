import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListComponent as DepartmentsListComponent } from './list.component';
import { AddEditComponent as DepartmentsAddEditComponent } from './add-edit.component';

const routes: Routes = [
    { path: '', component: DepartmentsListComponent },
    { path: 'add', component: DepartmentsAddEditComponent },
    { path: 'edit/:id', component: DepartmentsAddEditComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DepartmentsRoutingModule { } 