import { __decorate } from "tslib";
import { Component, Input, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
let ThreadComponent = class ThreadComponent {
    constructor(authService, router, threadsService, threadLikesService, likesService) {
        this.authService = authService;
        this.router = router;
        this.threadsService = threadsService;
        this.threadLikesService = threadLikesService;
        this.likesService = likesService;
        this.deleteThread = new EventEmitter();
        this.toggleEdit = false;
        this.showViews = false;
    }
    ngOnInit() {
        let path = this.router.url.split('/');
        if (path[1] == 'u' && this.authService.currentUser && this.authService.currentUser.username == this.thread.user.username)
            this.showViews = true;
    }
    goAccess(type) {
        this.authService.toggleAccess = true;
        this.authService.register = true;
        if (type == 'login')
            this.authService.toggleLogin = true;
        else {
            this.authService.toggleLogin = false;
        }
    }
    toggleMoreOptions(e) {
        e.stopPropagation();
        this.toggleEdit = !this.toggleEdit;
    }
    editPost(e) {
        this.toggleEdit = false;
        e.stopPropagation();
        if (this.thread.fromWeb) {
            this.threadsService.threadToEdit = _.cloneDeep(this.thread);
            this.threadsService.threadToEditOriginal = this.thread;
            this.router.navigateByUrl('/create-post');
        }
        else {
            alert('This post was created in the DTG app, please go there to edit it.');
        }
    }
    deletePost(e) {
        this.toggleEdit = false;
        e.stopPropagation();
        var r = confirm("Do you want to delete this post");
        if (r == true) {
            let data = {
                tId: this.thread._id,
                userId: this.authService.currentUser._id
            };
            this.deleteThread.emit(this.thread._id);
            this.threadsService.deleteThread(data)
                .subscribe((success) => {
                if (success) {
                }
                else {
                    this.authService.errorMessage = 'Could not delete post. Please try again later';
                    setTimeout(() => {
                        this.authService.errorMessage = null;
                    }, 3000);
                }
            }, (err) => {
                this.authService.errorMessage = 'Could not delete post. Please try again later';
                setTimeout(() => {
                    this.authService.errorMessage = null;
                }, 3000);
            });
        }
        else {
        }
    }
    itemTapped($event) {
        this.threadsService.currentThread = this.thread;
        this.router.navigate(['/posts', this.thread._id]);
    }
    goToUser(event) {
        event.stopPropagation();
        this.router.navigate(['/u', this.thread.user.username]);
    }
    like(e) {
        e.stopPropagation();
        if (this.authService.isLoggedIn()) {
            if (this.userHasLiked(this.thread)) {
                this.thread.likedByUser = false;
                this.thread.count -= 1;
                this.threadLikesService.deleteThreadLike(this.thread, this.authService.currentUser._id);
            }
            else {
                this.thread.likedByUser = true;
                this.thread.count += 1;
                this.threadLikesService.postThreadLike(this.thread, this.authService.currentUser._id);
            }
        }
        else {
            //Mandar a signup
            this.authService.toggleAccess = true;
            this.authService.register = true;
            this.authService.toggleLogin = false;
        }
    }
    userHasLiked(thread) {
        if (this.authService.currentUser) {
            return this.likesService.userHasLiked(thread, this.authService.currentUser._id);
        }
        else {
            return false;
        }
    }
};
__decorate([
    Input()
], ThreadComponent.prototype, "thread", void 0);
__decorate([
    Input()
], ThreadComponent.prototype, "i", void 0);
__decorate([
    Output()
], ThreadComponent.prototype, "deleteThread", void 0);
ThreadComponent = __decorate([
    Component({
        selector: 'app-thread',
        templateUrl: './thread.component.html',
        styleUrls: ['./thread.component.scss']
    })
], ThreadComponent);
export { ThreadComponent };
//# sourceMappingURL=thread.component.js.map