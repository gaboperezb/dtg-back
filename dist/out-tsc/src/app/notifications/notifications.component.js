import { __decorate } from "tslib";
import { Component } from '@angular/core';
let NotificationsComponent = class NotificationsComponent {
    constructor(authService, router, titleService, likesService) {
        this.authService = authService;
        this.router = router;
        this.titleService = titleService;
        this.likesService = likesService;
        this.notifications = [];
        this.begin = 0;
        this.end = 20;
        this.wait = true;
        this.enableInfinite = true;
        this.loadingNotis = true;
        this.comment = "";
        this.toggleComment = false;
    }
    ngOnInit() {
        this.getNotis();
    }
    clearNotifications() {
        this.authService.currentUser.notifications = this.authService.currentUser.notifications.filter(n => n == 'message');
        this.titleService.setTitle('Discuss TheGame: Community-powered platform for sports fans');
        this.authService.notifications = 0; //Para que se quita el circulo hasta que se bajen las notificaciones (front end)
        this.authService.clearNotifications(0, "noti")
            .subscribe((success) => {
        }, (err) => {
        });
    }
    userHasLiked(thread) {
        if (this.authService.currentUser) {
            return this.likesService.userHasLiked(thread, this.authService.currentUser._id);
        }
        else {
            return false;
        }
    }
    goToUser(event, user) {
        event.stopPropagation();
        this.router.navigate(['/u', user.username]);
    }
    getNotis(event) {
        this.enableInfinite = false;
        this.authService.getNotis()
            .subscribe((notis) => {
            notis = notis.filter(noti => noti.thread || noti.take || noti.trivia || noti.typeOf == 'follow');
            let notisMapped = notis.map((noti) => {
                if (noti.typeOf != 'follow') {
                    noti.timeline.date = new Date(noti.timeline.date);
                    noti.timeline.created = this.created(noti.timeline);
                    noti.notification.date = new Date(noti.notification.date);
                    noti.notification.created = this.created(noti.notification);
                    noti.timeline.likedByUser = this.userHasLiked(noti.timeline);
                    if (noti.thread) {
                        if (noti.threadTitle) {
                            let reducedText = noti.threadTitle.substring(0, 40);
                            if (reducedText.length < noti.threadTitle.length) {
                                noti.titleToShow = noti.threadTitle.substring(0, 40) + "...";
                            }
                            else {
                                noti.titleToShow = noti.threadTitle;
                            }
                        }
                    }
                    if (noti.take) {
                        if (noti.takeTitle) {
                            let reducedText = noti.takeTitle.substring(0, 40);
                            if (reducedText.length < noti.takeTitle.length) {
                                noti.titleToShow = noti.takeTitle.substring(0, 40) + "...";
                            }
                            else {
                                noti.titleToShow = noti.takeTitle;
                            }
                        }
                    }
                    if (noti.replyText) {
                        let reducedTextMention = noti.replyText.substring(0, 40);
                        if (reducedTextMention.length < noti.replyText.length) {
                            noti.replyTextToShow = noti.replyText.substring(0, 40) + "...";
                        }
                        else {
                            noti.replyTextToShow = noti.replyText;
                        }
                    }
                }
                else {
                    noti.date = new Date(noti.date);
                    noti.created = this.created(noti);
                }
                return noti;
            });
            this.notifications = notisMapped;
            this.authService.visibleNotifications = this.notifications;
            if (this.authService.notifications > 0)
                this.clearNotifications();
            this.wait = false;
            this.loadingNotis = false;
            this.enableInfinite = true;
        }, (err) => {
            this.enableInfinite = true;
            this.loadingNotis = false;
            this.wait = false;
        });
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
NotificationsComponent = __decorate([
    Component({
        selector: 'app-notifications',
        templateUrl: './notifications.component.html',
        styleUrls: ['./notifications.component.scss']
    })
], NotificationsComponent);
export { NotificationsComponent };
//# sourceMappingURL=notifications.component.js.map