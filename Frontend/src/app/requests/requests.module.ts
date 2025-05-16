import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { RequestsRoutingModule } from './requests-routing.module';
import { AddComponent } from './add.component';
import { RequestsListComponent } from './requests-list.component';
import { RequestsViewComponent } from './requests-view.component';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RequestsRoutingModule,
        AddComponent,
        RequestsListComponent,
        RequestsViewComponent
    ],
    declarations: []
})
export class RequestsModule { } 