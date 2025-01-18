import { __decorate, __param } from "tslib";
import { Component, Input, Output, EventEmitter, Inject } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
let TimelineItemComponent = class TimelineItemComponent {
    constructor(authService, likesService, router, el, platformId, webSocketService, threadDiscussionService) {
        this.authService = authService;
        this.likesService = likesService;
        this.router = router;
        this.el = el;
        this.platformId = platformId;
        this.webSocketService = webSocketService;
        this.threadDiscussionService = threadDiscussionService;
        this.replied = false;
        this.loadingAnswers = false;
        this.answers = [];
        this.errorMessage = "";
        this.comment = "";
        this.sendingComment = false;
        this.textareaFocused = false;
        this.toggleComment = false;
        this.toggleReplies = false;
        this.deleteComment = new EventEmitter();
        this.toggleEdit = false;
        this.editComment = false;
        this.discussionOrAnswer = "discussion"; //Para que likers service distinga entre timeline y respuesta, y así aplicar DRY.
    }
    toggleMoreOptions() {
        this.toggleEdit = !this.toggleEdit;
    }
    destroyChild(comment) {
        this.editComment = false;
        if (comment)
            this.timeline.discussion = comment;
    }
    commentFocused() {
        this.textareaFocused = true;
    }
    commentUnfocused() {
        this.textareaFocused = false;
    }
    filterAnswers(answerId) {
        this.answers = this.answers.filter(_answer => _answer._id !== answerId);
        this.timeline.numberOfAnswers -= 1;
    }
    addAnswer(answer) {
        this.answers.push(answer);
    }
    goToUser() {
        this.router.navigate(['/u', this.timeline.user.username]);
    }
    getAnswers() {
        this.toggleReplies = !this.toggleReplies;
        if (!this.answers.length || this.replied) {
            this.loadingAnswers = true;
            this.threadDiscussionService.getAnswers(this.timeline._id)
                .subscribe((answers) => {
                this.configureAnswers(answers);
            }, (err) => {
                this.authService.errorMessage = err;
                setTimeout(() => {
                    this.authService.errorMessage = null;
                }, 5000);
                this.loadingAnswers = false;
            });
        }
    }
    emitterImages() {
        setTimeout(() => {
            this.showVisible(null);
        }, 0);
    }
    isVisible(elem) {
        if (isPlatformBrowser(this.platformId)) {
            let coords = elem.getBoundingClientRect();
            let windowHeight = document.documentElement.clientHeight;
            // top elem edge is visible OR bottom elem edge is visible
            let topVisible = coords.top > 0 && coords.top < windowHeight;
            let bottomVisible = coords.bottom < windowHeight && coords.bottom > 0;
            return topVisible || bottomVisible;
        }
    }
    showVisible(e) {
        if (isPlatformBrowser(this.platformId)) {
            for (let img of this.el.nativeElement.querySelectorAll('.user-picture')) {
                let realSrc = img.dataset.src;
                if (!realSrc)
                    continue;
                if (this.isVisible(img)) {
                    if (e != null) {
                        e.domWrite(() => {
                            img.src = realSrc;
                            img.dataset.src = '';
                        });
                    }
                    else {
                        img.src = realSrc;
                        img.dataset.src = '';
                    }
                    ;
                }
            }
        }
    }
    configureAnswers(answers) {
        answers.forEach((answer) => {
            answer.date = new Date(answer.date);
            answer.created = this.created(answer);
            answer.count = answer.likers.length;
            answer.likedByUser = this.userHasLiked(answer);
        });
        this.timeline.numberOfAnswers = answers.length;
        this.replied = false;
        setTimeout(() => {
            this.loadingAnswers = false;
            this.answers = answers;
        }, 500);
        /* setTimeout(() => {
            this.showVisible(null);
        }, 0); */
    }
    //emit
    sendComment() {
        if (this.comment.length == 0)
            return;
        if (this.authService.isLoggedIn()) {
            this.sendingComment = true;
            let data = {
                threadId: this.thread._id,
                response: this.comment,
                parent: this.timeline._id,
                userMention: this.timeline.user._id,
                playerIds: this.timeline.user.playerIds
            };
            this.threadDiscussionService.postAnswer(data, this.thread._id, this.timeline._id, this.timeline.discussion)
                .subscribe((answer) => {
                this.webSocketService.emitPost(this.thread._id, "thread", this.timeline.user._id, this.authService.currentUser._id);
                if (this.timeline.numberOfAnswers > 0)
                    this.timeline.numberOfAnswers += 1;
                else
                    this.timeline.numberOfAnswers = 1;
                answer.count = 0;
                this.thread.replies += 1;
                this.sendingComment = false;
                this.comment = "";
                this.toggleComment = false;
                answer.date = new Date(answer.date);
                answer.children = [];
                answer.created = '1min';
                answer.count = 0;
                answer.likedByUser = this.userHasLiked(answer);
                //Para evitar la operacion de 'Populate' en mongo.
                answer.user = {
                    username: this.authService.currentUser.username,
                    playerIds: this.authService.currentUser.playerIds,
                    profilePicture: this.authService.currentUser.profilePicture,
                    profilePictureThumbnail: this.authService.currentUser.profilePictureThumbnail,
                    _id: this.authService.currentUser._id,
                    badge: this.authService.currentUser.badge
                };
                answer.responding = { username: this.timeline.user.username };
                this.answers.unshift(answer);
                this.replied = true;
            }, (err) => {
                this.sendingComment = false;
                this.authService.errorMessage = err;
                setTimeout(() => {
                    this.authService.errorMessage = null;
                }, 5000);
            });
        }
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
    like() {
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
    created(thread) {
        let milliseconds = thread.date.getTime();
        let now = new Date();
        let millisecondsNow = now.getTime();
        let diffInHours = (millisecondsNow - milliseconds) / (1000 * 60 * 60); //hours
        let typeTime;
        if (diffInHours >= 24) {
            //DAYS
            let threadCreated = Math.floor(diffInHours / 24); //Template binding
            typeTime = "d";
            return `${threadCreated}${typeTime}`;
        }
        else if (diffInHours < 1 && diffInHours > 0) {
            //MINUTES
            let threadCreated = Math.ceil(diffInHours * 60); //Template binding
            typeTime = "min";
            return `${threadCreated}${typeTime}`;
        }
        else {
            //HOURS   
            let threadCreated = Math.floor(diffInHours); //Template binding
            typeTime = "h";
            return `${threadCreated}${typeTime}`;
        }
    }
    editTimeline() {
        this.editComment = true;
        this.toggleEdit = false;
    }
    deleteTimeline() {
        this.toggleEdit = false;
        var r = confirm("Do you want to delete this comment?");
        if (r == true) {
            let data = {
                dId: this.timeline._id,
                tId: this.thread._id,
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
};
__decorate([
    Input()
], TimelineItemComponent.prototype, "timeline", void 0);
__decorate([
    Input()
], TimelineItemComponent.prototype, "hideReplies", void 0);
__decorate([
    Input()
], TimelineItemComponent.prototype, "thread", void 0);
__decorate([
    Output()
], TimelineItemComponent.prototype, "deleteComment", void 0);
TimelineItemComponent = __decorate([
    Component({
        selector: 'app-timeline-item',
        templateUrl: './timeline-item.component.html',
        styleUrls: ['./timeline-item.component.scss']
    }),
    __param(4, Inject(PLATFORM_ID))
], TimelineItemComponent);
export { TimelineItemComponent };
//# sourceMappingURL=timeline-item.component.js.map