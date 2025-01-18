import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IThread, IAnswer, ITimeline, ITrivia } from '../../../shared/interfaces';
import { AuthService } from '../../../core/auth.service';
import { ThreadLikesService } from '../../../core/thread-likers.service';
import { ThreadDiscussionService } from '../../../core/thread-discussion.service';
import { WebSocketService } from '../../../core/websocket.service';

import { Router } from '@angular/router';
import { TakeDiscussionService } from 'src/app/core/take-discussion.service';
import { PlayDiscussionService } from 'src/app/core/play-discussion.service';



@Component({
	selector: 'app-play-trivia-answer-item',
	templateUrl: './play-trivia-answer-item.component.html',
	styleUrls: ['./play-trivia-answer-item.component.scss']
})
export class PlayTriviaAnswerItemComponent {

	@Input() trivia: ITrivia;
	@Output() imageVisible = new EventEmitter();
	@Output() filterAnswer = new EventEmitter();
	@Output() addAnswer = new EventEmitter();
	@Input() answer: IAnswer;
	@Input() timeline: ITimeline;
	toggleComment: boolean = false;
	editComment: boolean = false;
	toggleEdit: boolean = false;

	comment: string = "";
	sendingComment: boolean = false;
	textareaFocused: boolean = false;
	focus: string;
	last: boolean;
	showHideToggle: boolean = true;
	discussionOrAnswer: string = "answer"; //Para que likers service distinga entre answer y respuesta, y así aplicar DRY.

	constructor(
		public authService: AuthService,

		private router: Router,
		private takeDiscussionService: TakeDiscussionService,
		private likesService: ThreadLikesService,
		private playDiscussionService: PlayDiscussionService,
		private threadDiscussionService: ThreadDiscussionService,
		private webSocketService: WebSocketService) {

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

	goAccess(type: string) {
		this.authService.toggleAccess = true;
		this.authService.register = true;

		if (type == 'login') this.authService.toggleLogin = true;
		else {
			this.authService.toggleLogin = false;
		}

	}

	sendComment() {

		let parent;

		if (this.answer.parent == this.timeline._id) {
			parent = this.answer._id;
		} else {
			parent = this.answer.parent
		}

		if (this.authService.isLoggedIn()) {

			this.sendingComment = true;
			let data = {
				triviaId: this.trivia._id || String(this.trivia),
				response: this.comment,
				parent: parent,
				userMention: this.answer.user._id,
				playerIds: this.answer.user.playerIds
			}

			

			this.playDiscussionService.postTriviaAnswer(data, data.triviaId, this.timeline._id, this.answer.discussion, this.answer._id)
				.subscribe((_answer: any) => {

					if (this.timeline.numberOfAnswers > 0) this.timeline.numberOfAnswers += 1;
					else this.timeline.numberOfAnswers = 1;

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
					this.webSocketService.emitPost(this.trivia._id, "trivia", this.answer.user._id, this.authService.currentUser._id)
					_answer.responding = { username: this.answer.user.username };

					this.imageVisible.emit({});
					this.addAnswer.emit(_answer)

					this.sendingComment = false;
					this.comment = "";
					this.toggleComment = false;



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
				triviaId: this.trivia._id || this.trivia,
				userId: this.authService.currentUser._id
			}


			this.filterAnswer.emit(this.answer._id);
			this.playDiscussionService.deleteTriviaAnswer(data)
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

	toggleMoreOptions() {
		this.toggleEdit = !this.toggleEdit;
	}

	destroyChild(comment: string) {
		this.editComment = false;
		if (comment) this.answer.discussion = comment;
	}


	like() {

		if (this.authService.isLoggedIn()) {
			if (this.userHasLiked(this.answer)) {
				this.answer.likedByUser = false;
				this.answer.count -= 1;
				this.likesService.deleteLike(this.discussionOrAnswer, this.timeline, this.authService.currentUser._id, this.answer);

			} else {
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



	userHasLiked(answer: IAnswer) {
		if (this.authService.isLoggedIn()) {
			return this.likesService.userHasLiked(answer, this.authService.currentUser._id);
		} else {
			return false;
		}
	}



	created(thread: IAnswer): string {

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


}
