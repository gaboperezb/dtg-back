import { __decorate, __param } from "tslib";
import { Component, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
let UserDiscussionsComponent = class UserDiscussionsComponent {
    constructor(platformId, discussionService, authService, threadDiscussionService, route, adminService) {
        this.platformId = platformId;
        this.discussionService = discussionService;
        this.authService = authService;
        this.threadDiscussionService = threadDiscussionService;
        this.route = route;
        this.adminService = adminService;
        this.skip = 0;
        this.expandInput = false;
    }
    ngOnInit() {
        this.discussions = this.route.snapshot.data['discussions'];
    }
    deleteComment(e, timeline) {
        e.stopPropagation();
        if (isPlatformBrowser(this.platformId)) {
            // Client only code.
            if (window.confirm("Do you really want to delete this comment?")) {
                let data = {
                    dId: timeline._id,
                    userId: timeline.user,
                    tId: timeline.thread._id //id
                };
                this.threadDiscussionService.deletePost(data)
                    .subscribe((success) => {
                    if (success) {
                        this.discussions = this.discussions.filter(_discussion => _discussion._id != timeline._id);
                    }
                    else {
                        this.authService.errorMessage = "Failed to delete comment";
                        setTimeout(() => { this.authService.errorMessage = null; }, 5000);
                    }
                }, (err) => {
                    this.authService.errorMessage = err;
                });
            }
        }
    }
    deleteGameComment(e, comment) {
        e.stopPropagation();
        if (isPlatformBrowser(this.platformId)) {
            if (window.confirm("Do you really want to delete this comment?")) {
                let data = {
                    dId: comment._id,
                    gId: comment.game._id,
                    userId: comment.user
                };
                this.discussionService.deletePost(data)
                    .subscribe((success) => {
                    if (success) {
                        this.discussions = this.discussions.filter(_discussion => _discussion._id != comment._id);
                    }
                    else {
                        this.authService.errorMessage = "Failed to delete comment";
                        setTimeout(() => { this.authService.errorMessage = null; }, 5000);
                    }
                }, (err) => {
                    this.authService.errorMessage = err;
                });
            }
        }
    }
    toggleResponse() {
        this.expandInput = true;
    }
};
UserDiscussionsComponent = __decorate([
    Component({
        templateUrl: 'user-discussions.component.html',
        styleUrls: ['user-discussions.component.scss']
    }),
    __param(0, Inject(PLATFORM_ID))
], UserDiscussionsComponent);
export { UserDiscussionsComponent };
//# sourceMappingURL=user-discussions.component.js.map