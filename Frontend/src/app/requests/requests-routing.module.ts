import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddComponent } from './add.component';
import { RequestsListComponent } from './requests-list.component';
import { RequestsViewComponent } from './requests-view.component';

const routes: Routes = [
    { path: '', redirectTo: 'list', pathMatch: 'full' },
    { path: 'add', component: AddComponent },
    { path: 'list', component: RequestsListComponent },
    { path: 'view/:id', component: RequestsViewComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class RequestsRoutingModule { } 