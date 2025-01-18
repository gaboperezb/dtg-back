import { __decorate, __param } from "tslib";
import { Component, Input, Output, EventEmitter, Inject } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
let EditCommentComponent = class EditCommentComponent {
    constructor(platformId, authService, renderer, threadDiscussionService) {
        this.platformId = platformId;
        this.authService = authService;
        this.renderer = renderer;
        this.threadDiscussionService = threadDiscussionService;
        this.destroyComponent = new EventEmitter();
        this.editingComment = false;
    }
    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.renderer.addClass(document.body, 'modal-open');
        }
    }
    destroy(e) {
        e.stopPropagation();
        this.destroyComponent.emit("");
    }
    ngOnDestroy() {
        if (isPlatformBrowser(this.platformId)) {
            this.renderer.removeClass(document.body, 'modal-open');
        }
    }
    commentFocused() {
        this.textareaFocused = true;
    }
    commentUnfocused() {
        this.textareaFocused = false;
    }
    editDiscussion(e) {
        e.stopPropagation();
        this.editingComment = true;
        if (this.answerId) {
            let data = {
                userId: this.authService.currentUser._id,
                discussion: this.comment,
                commentId: this.timelineId,
                answerId: this.answerId
            };
            this.threadDiscussionService.editAnswer(data)
                .subscribe((comment) => {
                this.destroyComponent.emit(this.comment);
                this.editingComment = false;
            }, (err) => {
                this.editingComment = false;
                this.authService.errorMessage = err;
                setTimeout(() => {
                    this.authService.errorMessage = null;
                }, 5000);
            });
        }
        else {
            let data = {
                userId: this.authService.currentUser._id,
                discussion: this.comment,
                commentId: this.timelineId
            };
            this.threadDiscussionService.editComment(data)
                .subscribe((comment) => {
                this.destroyComponent.emit(this.comment);
                this.editingComment = false;
            }, (err) => {
                this.editingComment = false;
                this.authService.errorMessage = err;
                setTimeout(() => {
                    this.authService.errorMessage = null;
                }, 5000);
            });
            //answer
        }
    }
};
__decorate([
    Input()
], EditCommentComponent.prototype, "comment", void 0);
__decorate([
    Input()
], EditCommentComponent.prototype, "timelineId", void 0);
__decorate([
    Input()
], EditCommentComponent.prototype, "answerId", void 0);
__decorate([
    Output()
], EditCommentComponent.prototype, "destroyComponent", void 0);
EditCommentComponent = __decorate([
    Component({
        selector: 'app-edit-comment',
        templateUrl: './edit-comment.component.html',
        styleUrls: ['./edit-comment.component.scss']
    }),
    __param(0, Inject(PLATFORM_ID))
], EditCommentComponent);
export { EditCommentComponent };
//# sourceMappingURL=edit-comment.component.js.map