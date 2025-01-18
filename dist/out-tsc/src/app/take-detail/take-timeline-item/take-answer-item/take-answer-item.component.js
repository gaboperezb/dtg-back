import { __decorate } from "tslib";
import { Component, Input, Output, EventEmitter } from '@angular/core';
let TakeAnswerItemComponent = class TakeAnswerItemComponent {
    constructor(authService, router, takeDiscussionService, likesService, threadDiscussionService, webSocketService) {
        this.authService = authService;
        this.router = router;
        this.takeDiscussionService = takeDiscussionService;
        this.likesService = likesService;
        this.threadDiscussionService = threadDiscussionService;
        this.webSocketService = webSocketService;
        this.imageVisible = new EventEmitter();
        this.filterAnswer = new EventEmitter();
        this.addAnswer = new EventEmitter();
        this.toggleComment = false;
        this.editComment = false;
        this.toggleEdit = false;
        this.comment = "";
        this.sendingComment = false;
        this.textareaFocused = false;
        this.showHideToggle = true;
        this.discussionOrAnswer = "answer"; //Para que likers service distinga entre answer y respuesta, y así aplicar DRY.
    }
    ngOnInit() {
    }
    commentFocused() {
        this.textareaFocused = true;
    }
    commentUnfocused() {
        this.textareaFocused = false;
    }
    goToUser() {
        this.router.navigate(['/u', this.answer.user.username]);
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
    sendComment() {
        let parent;
        if (this.answer.parent == this.timeline._id) {
            parent = this.answer._id;
        }
        else {
            parent = this.answer.parent;
        }
        if (this.authService.isLoggedIn()) {
            this.sendingComment = true;
            let data = {
                threadId: this.take._id || String(this.take),
                response: this.comment,
                parent: parent,
                userMention: this.answer.user._id,
                playerIds: this.answer.user.playerIds
            };
            this.takeDiscussionService.postAnswer(data, data.threadId, this.timeline._id, this.answer.discussion, this.answer._id)
                .subscribe((_answer) => {
                if (this.timeline.numberOfAnswers > 0)
                    this.timeline.numberOfAnswers += 1;
                else
                    this.timeline.numberOfAnswers = 1;
                _answer.date = new Date(_answer.date);
                _answer.created = "1min";
                _answer.count = 0;
                _answer.likedByUser = this.userHasLiked(_answer);
                //Para evitar la operacion de 'Populate' en mongo.
                _answer.user = {
                    username: this.authService.currentUser.username,
                    playerIds: this.authService.currentUser.playerIds,
                    profilePicture: this.authService.currentUser.profilePicture,
                    profilePictureThumbnail: this.authService.currentUser.profilePictureThumbnail,
                    _id: this.authService.currentUser._id,
                    badge: this.authService.currentUser.badge
                };
                //socket io
                this.webSocketService.emitPost(this.take._id, "take", this.answer.user._id, this.authService.currentUser._id);
                _answer.responding = { username: this.answer.user.username };
                if (this.take.replies)
                    this.take.replies += 1;
                this.imageVisible.emit({});
                this.addAnswer.emit(_answer);
                this.sendingComment = false;
                this.comment = "";
                this.toggleComment = false;
            }, (err) => {
                this.sendingComment = false;
                this.authService.errorMessage = err;
                setTimeout(() => {
                    this.authService.errorMessage = null;
                }, 5000);
            });
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
                aId: this.answer._id,
                takeId: this.take._id || this.take,
                userId: this.authService.currentUser._id
            };
            this.filterAnswer.emit(this.answer._id);
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
        else {
        }
    }
    toggleMoreOptions() {
        this.toggleEdit = !this.toggleEdit;
    }
    destroyChild(comment) {
        this.editComment = false;
        if (comment)
            this.answer.discussion = comment;
    }
    like() {
        if (this.authService.isLoggedIn()) {
            if (this.userHasLiked(this.answer)) {
                this.answer.likedByUser = false;
                this.answer.count -= 1;
                this.likesService.deleteLike(this.discussionOrAnswer, this.timeline, this.authService.currentUser._id, this.answer);
            }
            else {
                this.answer.likedByUser = true;
                this.answer.count += 1;
                this.likesService.postLike(this.discussionOrAnswer, this.timeline, this.authService.currentUser._id, this.answer);
            }
        }
        else {
            //mandar a registrarse
            this.authService.toggleAccess = true;
            this.authService.register = true;
            this.authService.toggleLogin = false;
        }
    }
    userHasLiked(answer) {
        if (this.authService.isLoggedIn()) {
            return this.likesService.userHasLiked(answer, this.authService.currentUser._id);
        }
        else {
            return false;
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
};
__decorate([
    Output()
], TakeAnswerItemComponent.prototype, "imageVisible", void 0);
__decorate([
    Output()
], TakeAnswerItemComponent.prototype, "filterAnswer", void 0);
__decorate([
    Output()
], TakeAnswerItemComponent.prototype, "addAnswer", void 0);
__decorate([
    Input()
], TakeAnswerItemComponent.prototype, "answer", void 0);
__decorate([
    Input()
], TakeAnswerItemComponent.prototype, "timeline", void 0);
__decorate([
    Input()
], TakeAnswerItemComponent.prototype, "take", void 0);
TakeAnswerItemComponent = __decorate([
    Component({
        selector: 'app-take-answer-item',
        templateUrl: './take-answer-item.component.html',
        styleUrls: ['./take-answer-item.component.scss']
    })
], TakeAnswerItemComponent);
export { TakeAnswerItemComponent };
//# sourceMappingURL=take-answer-item.component.js.map