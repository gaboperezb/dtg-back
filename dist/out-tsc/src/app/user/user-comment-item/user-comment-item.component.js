import { __decorate } from "tslib";
import { Component, Input, Output, EventEmitter } from '@angular/core';
let UserCommentItemComponent = class UserCommentItemComponent {
    constructor(authService, threadDiscussionService, likesService, takeDiscussionService, router) {
        this.authService = authService;
        this.threadDiscussionService = threadDiscussionService;
        this.likesService = likesService;
        this.takeDiscussionService = takeDiscussionService;
        this.router = router;
        this.deleteComment = new EventEmitter();
        this.toggleEdit = false;
        this.editComment = false;
    }
    ngOnInit() {
        if (this.discussionOrAnswer == 'answer') {
            this.timeline.thread = this.parent.thread;
            this.timeline.take = this.parent.take;
        }
    }
    userHasLiked(timeline) {
        if (this.authService.isLoggedIn()) {
            return this.likesService.userHasLiked(timeline, this.authService.currentUser._id);
        }
        else {
            return false;
        }
    }
    handleLike(e) {
        if (this.discussionOrAnswer == 'discussion')
            this.like(e);
        else {
            this.likeAnswer(e);
        }
    }
    goToComment() {
        if (this.parent) {
            this.authService.scrollTo = this.timeline._id;
            this.router.navigate(['/comments', this.parent._id]);
        }
        else {
            this.router.navigate(['/comments', this.timeline._id]);
        }
    }
    toggleMoreOptions(e) {
        e.stopPropagation();
        this.toggleEdit = !this.toggleEdit;
    }
    destroyChild(comment) {
        this.editComment = false;
        if (comment)
            this.timeline.discussion = comment;
    }
    editTimeline(e) {
        e.stopPropagation();
        this.editComment = true;
        this.toggleEdit = false;
    }
    deleteTimeline(e) {
        e.stopPropagation();
        this.toggleEdit = false;
        var r = confirm("Do you want to delete this comment?");
        if (r == true) {
            if (this.timeline.thread) {
                if (this.discussionOrAnswer == 'discussion') {
                    let data = {
                        dId: this.timeline._id,
                        tId: this.timeline.thread,
                        userId: this.authService.currentUser._id
                    };
                    this.deleteComment.emit(this.timeline._id);
                    this.threadDiscussionService.deletePostMyThread(data)
                        .subscribe((success) => {
                        if (success) {
                        }
                        else {
                            this.authService.errorMessage = 'Could not delete comment. Please try again later';
                            setTimeout(() => {
                                this.authService.errorMessage = null;
                            }, 3000);
                        }
                    }, (err) => {
                        this.authService.errorMessage = 'Could not delete comment. Please try again later';
                        setTimeout(() => {
                            this.authService.errorMessage = null;
                        }, 3000);
                    });
                }
                else {
                    let data = {
                        dId: this.parent._id,
                        aId: this.timeline._id,
                        tId: this.parent.thread,
                        userId: this.authService.currentUser._id
                    };
                    this.deleteComment.emit(this.timeline._id);
                    this.threadDiscussionService.deletePost(data)
                        .subscribe((success) => {
                        if (success) {
                        }
                        else {
                            this.authService.errorMessage = 'Could not delete comment. Please try again later';
                            setTimeout(() => {
                                this.authService.errorMessage = null;
                            }, 3000);
                        }
                    }, (err) => {
                        this.authService.errorMessage = 'Could not delete comment. Please try again later';
                        setTimeout(() => {
                            this.authService.errorMessage = null;
                        }, 3000);
                    });
                }
            }
            else {
                if (this.discussionOrAnswer == 'discussion') {
                    let data = {
                        dId: this.timeline._id,
                        takeId: this.timeline.take,
                        userId: this.authService.currentUser._id
                    };
                    this.deleteComment.emit(this.timeline._id);
                    this.takeDiscussionService.deletePostMyTake(data)
                        .subscribe((success) => {
                        if (success) {
                        }
                        else {
                            this.authService.errorMessage = 'Could not delete comment. Please try again later';
                            setTimeout(() => {
                                this.authService.errorMessage = null;
                            }, 3000);
                        }
                    }, (err) => {
                        this.authService.errorMessage = 'Could not delete comment. Please try again later';
                        setTimeout(() => {
                            this.authService.errorMessage = null;
                        }, 3000);
                    });
                }
                else {
                    let data = {
                        dId: this.parent._id,
                        aId: this.timeline._id,
                        takeId: this.parent.take,
                        userId: this.authService.currentUser._id
                    };
                    this.deleteComment.emit(this.timeline._id);
                    this.takeDiscussionService.deletePost(data)
                        .subscribe((success) => {
                        if (success) {
                        }
                        else {
                            this.authService.errorMessage = 'Could not delete comment. Please try again later';
                            setTimeout(() => {
                                this.authService.errorMessage = null;
                            }, 3000);
                        }
                    }, (err) => {
                        this.authService.errorMessage = 'Could not delete comment. Please try again later';
                        setTimeout(() => {
                            this.authService.errorMessage = null;
                        }, 3000);
                    });
                }
            }
        }
        else {
        }
    }
    like(e) {
        e.stopPropagation();
        if (this.authService.isLoggedIn()) {
            if (this.userHasLiked(this.timeline)) {
                this.timeline.likedByUser = false;
                this.timeline.count -= 1;
                this.likesService.deleteLike(this.discussionOrAnswer, this.timeline, this.authService.currentUser._id);
            }
            else {
                this.timeline.likedByUser = true;
                this.timeline.count += 1;
                this.likesService.postLike(this.discussionOrAnswer, this.timeline, this.authService.currentUser._id);
            }
        }
        else {
            //Mandar a signup
            this.authService.toggleAccess = true;
            this.authService.register = true;
            this.authService.toggleLogin = false;
        }
    }
    likeAnswer(e) {
        if (this.authService.isLoggedIn()) {
            if (this.userHasLiked(this.timeline)) {
                this.timeline.likedByUser = false;
                this.timeline.count -= 1;
                this.likesService.deleteLike('answer', this.parent, this.authService.currentUser._id, this.timeline);
            }
            else {
                this.timeline.likedByUser = true;
                this.timeline.count += 1;
                this.likesService.postLike('answer', this.parent, this.authService.currentUser._id, this.timeline);
            }
        }
    }
};
__decorate([
    Input()
], UserCommentItemComponent.prototype, "timeline", void 0);
__decorate([
    Input()
], UserCommentItemComponent.prototype, "parent", void 0);
__decorate([
    Input()
], UserCommentItemComponent.prototype, "discussionOrAnswer", void 0);
__decorate([
    Output()
], UserCommentItemComponent.prototype, "deleteComment", void 0);
UserCommentItemComponent = __decorate([
    Component({
        selector: 'app-user-comment-item',
        templateUrl: './user-comment-item.component.html',
        styleUrls: ['./user-comment-item.component.scss']
    })
], UserCommentItemComponent);
export { UserCommentItemComponent };
//# sourceMappingURL=user-comment-item.component.js.map