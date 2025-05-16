import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { JwtInterceptor, ErrorInterceptor } from './app/_helpers';
import { appInitializer } from './app/_helpers/app.initializer';
import { AccountService } from './app/_services/account.service';
import { AppRoutingModule } from './app/app-routing.module';

if (environment.production) {
    enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(BrowserModule, AppRoutingModule),
        provideHttpClient(withInterceptorsFromDi()),
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        {
            provide: 'APP_INITIALIZER',
            useFactory: appInitializer,
            multi: true,
            deps: [AccountService]
        }
    ]
}).catch(err => console.error(err));
