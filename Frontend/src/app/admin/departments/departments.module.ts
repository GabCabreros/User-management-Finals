import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { DepartmentsRoutingModule } from './departments-routing.module';
import { ListComponent as DepartmentsListComponent } from './list.component';
import { AddEditComponent as DepartmentsAddEditComponent } from './add-edit.component';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        DepartmentsRoutingModule,
        DepartmentsListComponent,
        DepartmentsAddEditComponent
    ],
    declarations: []
})
export class DepartmentsModule { } 