import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

import { Alert, AlertType } from '../_models/alert';
import { AlertService } from '../_services/alert.service';

@Component({ 
    selector: 'alert', 
    templateUrl: 'alert.component.html',
    standalone: true,
    imports: [
        CommonModule
    ]
})
export class AlertComponent implements OnInit, OnDestroy {
    @Input() id = 'default-alert';
    @Input() fade = true; // fade alert on route change

    alerts: Alert[] = [];
    alertSubscription: Subscription = new Subscription();
    routeSubscription: Subscription = new Subscription();

    constructor(private router: Router, private alertService: AlertService) { }

    ngOnInit() {
        // subscribe to new alert notifications
        this.alertSubscription = this.alertService.onAlert(this.id)
            .subscribe(alert => {
                // clear alerts when an empty alert is received
                if (!alert.message) {
                    // filter out alerts without 'keepAfterRouteChange' flag
                    this.alerts = this.alerts.filter(x => x.keepAfterRouteChange);

                    // remove 'keepAfterRouteChange' flag on the rest
                    this.alerts.forEach(x => x.keepAfterRouteChange = false);
                    return;
                }

                // add alert to array
                this.alerts.push(alert);

                // don't auto close emails with verification links
                if (alert.message.includes('verify-email') || alert.message.includes('reset-password')) {
                    alert.autoClose = false;
                }

                // auto close alert if required
                if (alert.autoClose) {
                    setTimeout(() => this.removeAlert(alert), 10000);
                }
            });

            // clear alert on route change
            this.routeSubscription = this.router.events.subscribe(event => {
                if (event instanceof NavigationStart) {
                    this.alertService.clear(this.id);
                }
            });
    }

    ngOnDestroy() {
        // unsubscribe to avoid memory leaks
        this.alertSubscription.unsubscribe();
        this.routeSubscription.unsubscribe();
    }

    removeAlert(alert: Alert) {
        // check if already removed to prevent error on auto close
        if (!this.alerts.includes(alert)) return;

        if (this.fade) {
            // fade out alert
            alert.fade = true;

            // remove alert after faded
            setTimeout(() => {
                this.alerts = this.alerts.filter(x => x !== alert)
            }, 250);
        } else {
            // remove alert 
            this.alerts = this.alerts.filter(x => x !== alert);
        }
    }

    cssClass(alert: Alert) {
        if (!alert) return '';

        const classes = ['alert', 'alert-dismissable'];

        const alertTypeClass = {
            [AlertType.Success]: 'alert alert-success',
            [AlertType.Error]: 'alert alert-danger',
            [AlertType.Info]: 'alert alert-info',
            [AlertType.Warning]: 'alert alert-warning'
        }

        classes.push(alertTypeClass[alert.type]);

        if (alert.fade) {
            classes.push('fade');
        }

        return classes.join(' ');
    }
}
