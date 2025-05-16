import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink, RouterLinkActive } from '@angular/router';

@Component({ 
    templateUrl: 'subnav.component.html',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        RouterLink,
        RouterLinkActive
    ]
})
export class SubNavComponent { }
