import { __decorate, __param } from "tslib";
import { Component, Inject } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
let UserPostsComponent = class UserPostsComponent {
    constructor(threadsService, route, platformId, adminService, authService, router) {
        this.threadsService = threadsService;
        this.route = route;
        this.platformId = platformId;
        this.adminService = adminService;
        this.authService = authService;
        this.router = router;
        this.skip = 0;
    }
    ngOnInit() {
        this.threads = this.route.snapshot.data['threads'];
    }
    edit(thread) {
        this.threadsService.threadToEdit = thread;
        this.router.navigateByUrl('/create');
    }
    deletePost(e, thread) {
        e.stopPropagation();
        if (isPlatformBrowser(this.platformId)) {
            if (window.confirm("Do you really want to delete this thread?")) {
                let data = {
                    tId: thread._id,
                    userId: thread.user
                };
                this.threadsService.deleteThread(data)
                    .subscribe((success) => {
                    if (success) {
                        this.threads = this.threads.filter(_thread => _thread._id != thread._id);
                    }
                    else {
                        this.authService.errorMessage = "Failed to delete thread";
                        setTimeout(() => { this.authService.errorMessage = null; }, 5000);
                    }
                }, (err) => {
                    this.authService.errorMessage = err;
                });
            }
        }
    }
};
UserPostsComponent = __decorate([
    Component({
        templateUrl: 'user-posts.component.html',
        styleUrls: ['user-posts.component.scss']
    }),
    __param(2, Inject(PLATFORM_ID))
], UserPostsComponent);
export { UserPostsComponent };
//# sourceMappingURL=user-posts.component.js.map