import { Component, Input, Output, EventEmitter, ElementRef, Inject } from '@angular/core';
import { ViewChild } from '@angular/core';
import { IThread, ITimeline, IAnswer } from '../../../app/shared/interfaces';
import { AuthService } from '../../../app/core/auth.service';
import { ThreadLikesService } from '../../../app/core/thread-likers.service';
import { ThreadDiscussionService } from '../../../app/core/thread-discussion.service';
//import { WebSocketService } from '../../app/core/websocket.service';
import { Router } from '@angular/router';
import { WebSocketService } from 'src/app/core/websocket.service';
import * as _ from 'lodash';
import { EditCommentComponent } from 'src/app/edit-comment/edit-comment.component';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';


@Component({
    selector: 'app-timeline-item',
    templateUrl: './timeline-item.component.html',
    styleUrls: ['./timeline-item.component.scss']
})
export class TimelineItemComponent {



    replied: boolean = false;
    loadingAnswers: boolean = false;
    answers: IAnswer[] = [];
    errorMessage: string = "";
    comment: string = "";
    sendingComment: boolean = false;
    textareaFocused: boolean = false;
    toggleComment: boolean = false;
    toggleReplies: boolean = false;
    @Input() timeline: ITimeline;
    @Input() hideReplies: boolean;
    @Input() thread: IThread;
    @Output() deleteComment = new EventEmitter();
    profilePicture: any;
    toggleEdit: boolean = false;
    editComment: boolean = false;
    discussionOrAnswer: string = "discussion"; //Para que likers service distinga entre timeline y respuesta, y así aplicar DRY.

    constructor(
        public authService: AuthService,
        private likesService: ThreadLikesService,
        private router: Router,
        private el: ElementRef,
        @Inject(PLATFORM_ID) private platformId: Object,
        private webSocketService: WebSocketService,
        private threadDiscussionService: ThreadDiscussionService,
    ) {


    }

    toggleMoreOptions() {
        this.toggleEdit = !this.toggleEdit;
    }

    destroyChild(comment: string) {
        this.editComment = false;
        if (comment) this.timeline.discussion = comment;
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
        this.answers.push(answer)
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
                },
                    (err) => {
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
                if (!realSrc) continue;
    
                if (this.isVisible(img)) {
    
                    if (e != null) {
                        e.domWrite(() => {
                            img.src = realSrc;
                            img.dataset.src = ''
                        });
                    } else {
                        img.src = realSrc;
                        img.dataset.src = ''
                    }
    
    
                    ;
                }
            }
         }

    }

    configureAnswers(answers: IAnswer[]) {
        answers.forEach((answer) => {
            answer.date = new Date(answer.date);
            answer.created = this.created(answer);
            answer.count = answer.likers.length;
            answer.likedByUser = this.userHasLiked(answer);

        })

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

        if (this.comment.length == 0) return
        if (this.authService.isLoggedIn()) {
            this.sendingComment = true;
            let data = {
                threadId: this.thread._id,
                response: this.comment,
                parent: this.timeline._id,
                userMention: this.timeline.user._id,
                playerIds: this.timeline.user.playerIds
            }

            this.threadDiscussionService.postAnswer(data, this.thread._id, this.timeline._id, this.timeline.discussion)
                .subscribe((answer: any) => {

                    this.webSocketService.emitPost(this.thread._id, "thread", this.timeline.user._id, this.authService.currentUser._id)
                    if (this.timeline.numberOfAnswers > 0) this.timeline.numberOfAnswers += 1;
                    else this.timeline.numberOfAnswers = 1;
                    answer.count = 0;
                    this.thread.replies += 1;
                    this.sendingComment = false;
                    this.comment = "";
                    this.toggleComment = false;
                    answer.date = new Date(answer.date);
                    answer.children = [];
                    answer.created = '1min'
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

                },
                    (err) => {
                        this.sendingComment = false;
                        this.authService.errorMessage = err;
                        setTimeout(() => {
                            this.authService.errorMessage = null;
                        }, 5000);

                    });
        }
    }

    goAccess(type: string) {
        this.authService.toggleAccess = true;
        this.authService.register = true;

        if (type == 'login') this.authService.toggleLogin = true;
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

            } else {
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

    created(thread: any): string {

        let milliseconds = thread.date.getTime();
        let now = new Date();
        let millisecondsNow = now.getTime();
        let diffInHours = (millisecondsNow - milliseconds) / (1000 * 60 * 60); //hours
        let typeTime;

        if (diffInHours >= 24) {
            //DAYS
            let threadCreated = Math.floor(diffInHours / 24); //Template binding
            typeTime = "d"
            return `${threadCreated}${typeTime}`

        } else if (diffInHours < 1 && diffInHours > 0) {
            //MINUTES
            let threadCreated = Math.ceil(diffInHours * 60); //Template binding
            typeTime = "min"
            return `${threadCreated}${typeTime}`

        } else {
            //HOURS   
            let threadCreated = Math.floor(diffInHours); //Template binding
            typeTime = "h"
            return `${threadCreated}${typeTime}`

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
            }

            this.deleteComment.emit(this.timeline._id);
            this.threadDiscussionService.deletePostMyThread(data)
                .subscribe((success) => {
                    if (success) {

                    } else {

                        this.authService.errorMessage = 'Could not delete comment. Please try again later'
                        setTimeout(() => {
                            this.authService.errorMessage = null;
                        }, 3000);

                    }
                },
                    (err) => {
                        this.authService.errorMessage = 'Could not delete comment. Please try again later'
                        setTimeout(() => {
                            this.authService.errorMessage = null;
                        }, 3000);


                    });

        } else {

        }



    }



    userHasLiked(timeline: any) {
        if (this.authService.isLoggedIn()) {
            return this.likesService.userHasLiked(timeline, this.authService.currentUser._id);
        } else {
            return false;
        }
    }

}