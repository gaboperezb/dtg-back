import { __decorate } from "tslib";
import { Component, Input } from '@angular/core';
let ReportDetailComponent = class ReportDetailComponent {
    constructor(adminService, router) {
        this.adminService = adminService;
        this.router = router;
    }
    review() {
        this.report.reviewed = !this.report.reviewed;
        let data = {
            reviewed: this.report.reviewed
        };
        this.adminService.updateReport(data, this.report._id)
            .subscribe((report) => {
        });
    }
    ngOnInit() {
    }
    posts(id) {
        this.router.navigate(['/admin/posts', id]);
    }
    comments(id) {
        this.router.navigate(['/admin/discussions', id]);
    }
    replies(id) {
        this.router.navigate(['/admin/replies', id]);
    }
};
__decorate([
    Input()
], ReportDetailComponent.prototype, "report", void 0);
ReportDetailComponent = __decorate([
    Component({
        selector: 'report-detail',
        templateUrl: "report-detail.component.html",
        styleUrls: ['report-detail.component.scss']
    })
], ReportDetailComponent);
export { ReportDetailComponent };
//# sourceMappingURL=report-detail.component.js.map