import { __decorate } from "tslib";
import { Component } from '@angular/core';
let ReportsComponent = class ReportsComponent {
    constructor(adminService, authService) {
        this.adminService = adminService;
        this.authService = authService;
        this.loading = false;
        this.loadingAccount = false;
        this.loadingIP = false;
    }
    ngOnInit() {
        this.getReports();
    }
    getReports() {
        this.adminService.getReports()
            .subscribe((reports) => {
            this.reports = reports;
            console.log(reports);
        }, (err) => {
            this.authService.errorMessage = err;
        });
    }
};
ReportsComponent = __decorate([
    Component({
        templateUrl: 'reports.component.html',
        styleUrls: ['reports.component.scss']
    })
], ReportsComponent);
export { ReportsComponent };
//# sourceMappingURL=reports.component.js.map