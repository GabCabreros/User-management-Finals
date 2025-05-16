import { NgModule } from '@angular/core';

import { AccountsRoutingModule } from './accounts-routing.module';
import { ListComponent } from './list.component';
import { AddEditComponent } from './add-edit.component';
import { SharedModule } from '../../shared.module';

@NgModule({
    imports: [
        SharedModule,
        AccountsRoutingModule,
        ListComponent,
        AddEditComponent
    ],
    declarations: []
})
export class AccountsModule { }
