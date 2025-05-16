import { Injectable } from "@angular/core";
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";

import { AccountService } from "@app/_services";

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private accountService: AccountService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError((err) => {
                // Check if it's an authentication-related error (except for login attempts)
                if ([401, 403].includes(err.status) && 
                    this.accountService.accountValue && 
                    !request.url.includes('/authenticate')) {
                    // auto logout if 401 Unauthorized or 403 Forbidden response returned from api
                    this.accountService.logout();
                }

                // Extract the most useful error message
                let errorMessage = 'An unknown error occurred';
                
                // Check for error message in the response
                if (err.error) {
                    if (typeof err.error === 'string') {
                        errorMessage = err.error;
                    } else if (err.error.message) {
                        errorMessage = err.error.message;
                    }
                } else if (err.statusText) {
                    errorMessage = err.statusText;
                }
                
                // Log the error to console for debugging
                console.error('HTTP Error:', err);
                console.error('Error Message:', errorMessage);
                
                return throwError(errorMessage);
            }))
    }
}