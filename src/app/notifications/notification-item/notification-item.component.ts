import { Component, OnInit, Input } from '@angular/core';
import { AuthService } from 'src/app/core/auth.service';
import { Router } from '@angular/router';
import { ThreadDiscussionService } from 'src/app/core/thread-discussion.service';
import { WebSocketService } from 'src/app/core/websocket.service';
import { TakeDiscussionService } from 'src/app/core/take-discussion.service';
import { PlayDiscussionService } from 'src/app/core/play-discussion.service';

@Component({
	selector: 'app-notification-item',
	templateUrl: './notification-item.component.html',
	styleUrls: ['./notification-item.component.scss']
})
export class NotificationItemComponent implements OnInit {

	@Input() notification: any
	toggleComment: boolean = false;
	errorMessage: string = "";
    comment: string = "";
    sendingComment: boolean = false;
    textareaFocused: boolean = false;
  

	constructor(public authService: AuthService, 
		private router: Router, 
		private threadDiscussionService: ThreadDiscussionService,
		 private webSocketService: WebSocketService,
		 private playDiscussionService: PlayDiscussionService,
		 private takeDiscussionService: TakeDiscussionService) { }

	ngOnInit(): void {
		
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

		if (this.comment.length == 0) return
		this.sendingComment = true;
		if (this.notification.take) {

			this.sendTakeComment(this.comment, this.notification);
		} else if (this.notification.thread) {
			this.sendComment(this.comment, this.notification);
		} else {
			this.sendTriviaComment(this.comment, this.notification);
		}
	}

	goAccess(type: string) {
		this.authService.toggleAccess = true;
		this.authService.register = true;

		if(type == 'login') this.authService.toggleLogin = true;
		else {
			this.authService.toggleLogin = false;
		}
		
	}

	defineParent(notification: any) { //ui app

		if (notification.typeOf == "comment") return notification.notification._id;
		else {
			if (notification.replyType == 'discussion') return notification.notification._id;
			else {
				return notification.parent;
			}
		}

	}

	sendComment(comment: string, notification: any) {

		let data = {
			threadId: notification.thread,
			response: comment,
			parent: this.defineParent(notification),
			userMention: notification.user._id,
			playerIds: notification.user.playerIds
		}

		let aId = notification.typeOf == "comment" ? undefined : notification.notification._id;
		this.threadDiscussionService.postAnswer(data, notification.thread, notification.timeline._id, notification.notification.discussion, aId)
			.subscribe((answer: any) => {
				this.sendingComment = false;
				this.toggleComment = false;
				this.comment = "";
				this.webSocketService.emitPost(notification.thread, "thread", notification.user._id, this.authService.currentUser._id)

			},
				(err) => {
					this.sendingComment = false;
					this.authService.errorMessage = err;
					setTimeout(() => {
						this.authService.errorMessage = null;
					}, 5000);
				});

	}

	sendTakeComment(comment: string, notification: any) {

		let data = {
			takeId: notification.take,
			response: comment,
			parent: this.defineParent(notification),
			userMention: notification.user._id,
			playerIds: notification.user.playerIds
		}

		let aId = notification.typeOf == "comment" ? undefined : notification.notification._id;
		this.takeDiscussionService.postAnswer(data, notification.take, notification.timeline._id, notification.notification.discussion, aId)
			.subscribe((answer: any) => {

				this.comment = "";
				this.sendingComment = false;
				this.toggleComment = false;
				this.webSocketService.emitPost(notification.take, "take", notification.user._id, this.authService.currentUser._id)

			},
				(err) => {
					this.sendingComment = false;
					this.authService.errorMessage = err;
					setTimeout(() => {
						this.authService.errorMessage = null;
					}, 5000);
				});
	}

	sendTriviaComment(comment: string, notification: any) {


		let data = {
			triviaId: notification.trivia,
			response: comment,
			parent: this.defineParent(notification),
			userMention: notification.user._id,
			playerIds: notification.user.playerIds
		}

		let aId = notification.typeOf == "comment" ? undefined : notification.notification._id;
		this.playDiscussionService.postTriviaAnswer(data, notification.trivia, notification.timeline._id, notification.notification.discussion, aId)
			.subscribe((answer: any) => {

				this.toggleComment = false;
				this.comment = "";
				this.sendingComment = false;
				this.webSocketService.emitPost(notification.trivia, "trivia", notification.user._id, this.authService.currentUser._id)


			},
				(err) => {
					this.sendingComment = false;
					this.authService.errorMessage = err;
					setTimeout(() => {
						this.authService.errorMessage = null;
					}, 5000);
				})




				
	}


	goToUser() {

		this.router.navigate(['/u', this.notification.user.username]);
	}


	goToContext() {



		if (this.notification.typeOf == "comment") {
			this.router.navigate(['/comments', this.notification.notification._id]);
		
		}
		else {
			if (this.notification.replyType == 'discussion'){
				this.authService.scrollTo = this.notification.notification._id;
				this.router.navigate(['/comments', this.notification.timeline._id])
			}
			else {
				this.authService.scrollTo = this.notification.notification._id;
				this.router.navigate(['/comments', this.notification.timeline._id])
				
			}
		}

	}

}
