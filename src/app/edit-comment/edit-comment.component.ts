import { Component, OnInit, Input, Renderer2, Output, EventEmitter, Inject } from '@angular/core';
import { AuthService } from '../core/auth.service';
import { ThreadDiscussionService } from '../core/thread-discussion.service';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';

@Component({
	selector: 'app-edit-comment',
	templateUrl: './edit-comment.component.html',
	styleUrls: ['./edit-comment.component.scss']
})
export class EditCommentComponent implements OnInit {

	constructor(@Inject(PLATFORM_ID) private platformId: Object, public authService: AuthService, private renderer: Renderer2, private threadDiscussionService: ThreadDiscussionService) { }

	textareaFocused: boolean;

	@Input() comment: string;
	@Input() timelineId: string;
	@Input() answerId: string;
	@Output() destroyComponent = new EventEmitter();
	editingComment: boolean = false;

	ngOnInit() {


		if (isPlatformBrowser(this.platformId)) {
			this.renderer.addClass(document.body, 'modal-open');
		 }
		


	}

	destroy(e: any) {
		e.stopPropagation();
		this.destroyComponent.emit("")
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

	editDiscussion(e: any) {

		e.stopPropagation();

		this.editingComment = true;

		if (this.answerId) {

			let data = {
				userId: this.authService.currentUser._id,
				discussion: this.comment,
				commentId: this.timelineId,
				answerId: this.answerId
			}	

			this.threadDiscussionService.editAnswer(data)
				.subscribe((comment) => {

					this.destroyComponent.emit(this.comment)
					this.editingComment = false;

				},
					(err) => {

						this.editingComment = false;
						this.authService.errorMessage = err;
						setTimeout(() => {
							this.authService.errorMessage = null;
						}, 5000);

					})
			
		} else {

			let data = {
				userId: this.authService.currentUser._id,
				discussion: this.comment,
				commentId: this.timelineId
			}

			this.threadDiscussionService.editComment(data)
				.subscribe((comment) => {

					this.destroyComponent.emit(this.comment)
					this.editingComment = false;

				},
					(err) => {

						this.editingComment = false;
						this.authService.errorMessage = err;
						setTimeout(() => {
							this.authService.errorMessage = null;
						}, 5000);

					})
			//answer

			

		}
	}

}
