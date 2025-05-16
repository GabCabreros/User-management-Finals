import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { RequestsRoutingModule } from './requests-routing.module';
import { ListComponent as RequestsListComponent } from './list.component';
import { DetailsComponent as RequestsDetailsComponent } from './details.component';
import { AddEditComponent as RequestsAddEditComponent } from './add-edit.component';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RequestsRoutingModule,
        RequestsListComponent,
        RequestsDetailsComponent,
        RequestsAddEditComponent
    ],
    declarations: []
})
export class RequestsModule { } 