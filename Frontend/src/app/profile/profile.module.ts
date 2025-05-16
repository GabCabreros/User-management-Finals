import { NgModule } from '@angular/core';

import { ProfileRoutingModule } from './profile-routing.module';
import { LayoutComponent } from './layout.component';
import { DetailsComponent } from './details.component';
import { UpdateComponent } from './update.component';
import { SharedModule } from '../shared.module';

@NgModule({
    imports: [
        SharedModule,
        ProfileRoutingModule,
        LayoutComponent,
        DetailsComponent,
        UpdateComponent
    ],
    declarations: []
})
export class ProfileModule { }
