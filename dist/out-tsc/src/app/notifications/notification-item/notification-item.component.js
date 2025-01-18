import { __decorate } from "tslib";
import { Component, Input } from '@angular/core';
let NotificationItemComponent = class NotificationItemComponent {
    constructor(authService, router, threadDiscussionService, webSocketService, playDiscussionService, takeDiscussionService) {
        this.authService = authService;
        this.router = router;
        this.threadDiscussionService = threadDiscussionService;
        this.webSocketService = webSocketService;
        this.playDiscussionService = playDiscussionService;
        this.takeDiscussionService = takeDiscussionService;
        this.toggleComment = false;
        this.errorMessage = "";
        this.comment = "";
        this.sendingComment = false;
        this.textareaFocused = false;
    }
    ngOnInit() {
    }
    commentFocused() {
        this.textareaFocused = true;
    }
    commentUnfocused() {
        this.textareaFocused = false;
    }
    goToThread(notification, e) {
        this.router.navigate(['/posts', this.notification.thread]);
    }
    goToTake(notification, e) {
        this.router.navigate(['/discussions', this.notification.take]);
    }
    replyTo() {
        if (this.comment.length == 0)
            return;
        this.sendingComment = true;
        if (this.notification.take) {
            this.sendTakeComment(this.comment, this.notification);
        }
        else if (this.notification.thread) {
            this.sendComment(this.comment, this.notification);
        }
        else {
            this.sendTriviaComment(this.comment, this.notification);
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
    defineParent(notification) {
        if (notification.typeOf == "comment")
            return notification.notification._id;
        else {
            if (notification.replyType == 'discussion')
                return notification.notification._id;
            else {
                return notification.parent;
            }
        }
    }
    sendComment(comment, notification) {
        let data = {
            threadId: notification.thread,
            response: comment,
            parent: this.defineParent(notification),
            userMention: notification.user._id,
            playerIds: notification.user.playerIds
        };
        let aId = notification.typeOf == "comment" ? undefined : notification.notification._id;
        this.threadDiscussionService.postAnswer(data, notification.thread, notification.timeline._id, notification.notification.discussion, aId)
            .subscribe((answer) => {
            this.sendingComment = false;
            this.toggleComment = false;
            this.comment = "";
            this.webSocketService.emitPost(notification.thread, "thread", notification.user._id, this.authService.currentUser._id);
        }, (err) => {
            this.sendingComment = false;
            this.authService.errorMessage = err;
            setTimeout(() => {
                this.authService.errorMessage = null;
            }, 5000);
        });
    }
    sendTakeComment(comment, notification) {
        let data = {
            takeId: notification.take,
            response: comment,
            parent: this.defineParent(notification),
            userMention: notification.user._id,
            playerIds: notification.user.playerIds
        };
        let aId = notification.typeOf == "comment" ? undefined : notification.notification._id;
        this.takeDiscussionService.postAnswer(data, notification.take, notification.timeline._id, notification.notification.discussion, aId)
            .subscribe((answer) => {
            this.comment = "";
            this.sendingComment = false;
            this.toggleComment = false;
            this.webSocketService.emitPost(notification.take, "take", notification.user._id, this.authService.currentUser._id);
        }, (err) => {
            this.sendingComment = false;
            this.authService.errorMessage = err;
            setTimeout(() => {
                this.authService.errorMessage = null;
            }, 5000);
        });
    }
    sendTriviaComment(comment, notification) {
        let data = {
            triviaId: notification.trivia,
            response: comment,
            parent: this.defineParent(notification),
            userMention: notification.user._id,
            playerIds: notification.user.playerIds
        };
        let aId = notification.typeOf == "comment" ? undefined : notification.notification._id;
        this.playDiscussionService.postTriviaAnswer(data, notification.trivia, notification.timeline._id, notification.notification.discussion, aId)
            .subscribe((answer) => {
            this.toggleComment = false;
            this.comment = "";
            this.sendingComment = false;
            this.webSocketService.emitPost(notification.trivia, "trivia", notification.user._id, this.authService.currentUser._id);
        }, (err) => {
            this.sendingComment = false;
            this.authService.errorMessage = err;
            setTimeout(() => {
                this.authService.errorMessage = null;
            }, 5000);
        });
    }
    goToUser() {
        this.router.navigate(['/u', this.notification.user.username]);
    }
    goToContext() {
        if (this.notification.typeOf == "comment") {
            this.router.navigate(['/comments', this.notification.notification._id]);
        }
        else {
            if (this.notification.replyType == 'discussion') {
                this.authService.scrollTo = this.notification.notification._id;
                this.router.navigate(['/comments', this.notification.timeline._id]);
            }
            else {
                this.authService.scrollTo = this.notification.notification._id;
                this.router.navigate(['/comments', this.notification.timeline._id]);
            }
        }
    }
};
__decorate([
    Input()
], NotificationItemComponent.prototype, "notification", void 0);
NotificationItemComponent = __decorate([
    Component({
        selector: 'app-notification-item',
        templateUrl: './notification-item.component.html',
        styleUrls: ['./notification-item.component.scss']
    })
], NotificationItemComponent);
export { NotificationItemComponent };
//# sourceMappingURL=notification-item.component.js.map