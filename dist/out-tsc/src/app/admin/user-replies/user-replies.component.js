import { __decorate, __param } from "tslib";
import { Component, Inject } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
let UserRepliesComponent = class UserRepliesComponent {
    constructor(platformId, authService, discussionService, threadDiscussionService, route, adminService) {
        this.platformId = platformId;
        this.authService = authService;
        this.discussionService = discussionService;
        this.threadDiscussionService = threadDiscussionService;
        this.route = route;
        this.adminService = adminService;
        this.skip = 0;
        this.expandInput = false;
    }
    ngOnInit() {
        this.discussions = this.route.snapshot.data['discussions'];
    }
    deleteComment(e, answer) {
        e.stopPropagation();
        if (isPlatformBrowser(this.platformId)) {
            if (window.confirm("Do you really want to delete this comment?")) {
                let data = {
                    dId: answer._id,
                    aId: answer.answers._id,
                    tId: answer.thread._id,
                    userId: answer.answers.user
                };
                this.threadDiscussionService.deletePost(data)
                    .subscribe((success) => {
                    if (success) {
                        this.discussions = this.discussions.filter(_answer => _answer.answers._id !== answer.answers._id);
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
    deleteGameComment(e, answer) {
        e.stopPropagation();
        if (isPlatformBrowser(this.platformId)) {
            if (window.confirm("Do you really want to delete this comment?")) {
                let data = {
                    dId: answer._id,
                    aId: answer.answers._id,
                    gId: answer.game._id,
                    userId: answer.answers.user,
                };
                this.discussionService.deletePost(data)
                    .subscribe((success) => {
                    if (success) {
                        this.discussions = this.discussions.filter(_answer => _answer.answers._id !== answer.answers._id);
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
};
UserRepliesComponent = __decorate([
    Component({
        templateUrl: 'user-replies.component.html',
        styleUrls: ['user-replies.component.scss']
    }),
    __param(0, Inject(PLATFORM_ID))
], UserRepliesComponent);
export { UserRepliesComponent };
//# sourceMappingURL=user-replies.component.js.map