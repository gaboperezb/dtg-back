import { __decorate } from "tslib";
import { Component } from '@angular/core';
let PostDashboardComponent = class PostDashboardComponent {
    constructor(threadService, router) {
        this.threadService = threadService;
        this.router = router;
    }
    ngOnInit() {
        var a = localStorage.getItem('draft');
        if (!!a) {
            this.threadService.draftInitial = JSON.parse(a);
        }
    }
    selectType(type) {
        this.router.navigate(['/create'], { queryParams: { type } });
    }
    selectDraft() {
        console.log(this.threadService.draftInitial);
        this.router.navigate(['/create'], { queryParams: { type: this.threadService.draftInitial.type, draft: true } });
    }
};
PostDashboardComponent = __decorate([
    Component({
        selector: 'app-post-dashboard',
        templateUrl: './post-dashboard.component.html',
        styleUrls: ['./post-dashboard.component.scss']
    })
], PostDashboardComponent);
export { PostDashboardComponent };
//# sourceMappingURL=post-dashboard.component.js.map