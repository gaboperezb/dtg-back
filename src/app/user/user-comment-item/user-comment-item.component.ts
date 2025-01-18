import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ITimeline } from 'src/app/shared/interfaces';
import { AuthService } from 'src/app/core/auth.service';
import { ThreadLikesService } from 'src/app/core/thread-likers.service';
import { Router } from '@angular/router';
import { ThreadDiscussionService } from 'src/app/core/thread-discussion.service';
import { TakeDiscussionService } from 'src/app/core/take-discussion.service';

@Component({
	selector: 'app-user-comment-item',
	templateUrl: './user-comment-item.component.html',
	styleUrls: ['./user-comment-item.component.scss']
})
export class UserCommentItemComponent implements OnInit {

	@Input() timeline: any;
	@Input() parent: any;
	@Input() discussionOrAnswer: string;
	@Output() deleteComment = new EventEmitter();
	toggleEdit: boolean = false;
	editComment: boolean = false;

	constructor(
		public authService: AuthService,
		private threadDiscussionService: ThreadDiscussionService, 
		private likesService: ThreadLikesService,
		private takeDiscussionService: TakeDiscussionService,
		private router: Router) { }

	ngOnInit(): void {

		if(this.discussionOrAnswer == 'answer') {
			this.timeline.thread = this.parent.thread;
			this.timeline.take = this.parent.take;
		}
	}


	userHasLiked(timeline: any) {
		if (this.authService.isLoggedIn()) {
			return this.likesService.userHasLiked(timeline, this.authService.currentUser._id);
		} else {
			return false;
		}
	}

	handleLike(e: any) {
		if(this.discussionOrAnswer == 'discussion') this.like(e);
		else {
			this.likeAnswer(e)
		}
	}

	goToComment() {

		if(this.parent){
			this.authService.scrollTo = this.timeline._id;
			this.router.navigate(['/comments', this.parent._id])
		} 
		else {
			this.router.navigate(['/comments', this.timeline._id])
		}
	}

	toggleMoreOptions(e: any) {
		e.stopPropagation();
		this.toggleEdit = !this.toggleEdit;
    }
    
    destroyChild(comment: string) {
        this.editComment = false;
        if(comment) this.timeline.discussion = comment;
	}
	
	editTimeline(e: any) {
		
		e.stopPropagation();
		this.editComment = true;
        this.toggleEdit = false;
        
    }

    deleteTimeline(e: any) {

		e.stopPropagation();
        this.toggleEdit = false;
		var r = confirm("Do you want to delete this comment?");
		if (r == true) {

			

			if(this.timeline.thread) {

				if(this.discussionOrAnswer == 'discussion') {
					let data = {
						dId: this.timeline._id,
						tId: this.timeline.thread,
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

					let data = {
                
						dId: this.parent._id,
						aId: this.timeline._id,
						tId: this.parent.thread,
						userId: this.authService.currentUser._id
					}


		
					this.deleteComment.emit(this.timeline._id);
					this.threadDiscussionService.deletePost(data)
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

				}

				

			} else {


				if(this.discussionOrAnswer == 'discussion') {

					let data = {
						dId: this.timeline._id,
						takeId: this.timeline.take,
						userId: this.authService.currentUser._id
					}

					this.deleteComment.emit(this.timeline._id);
					this.takeDiscussionService.deletePostMyTake(data)
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

					let data = {
                
						dId: this.parent._id,
						aId: this.timeline._id,
						takeId: this.parent.take,
						userId: this.authService.currentUser._id
					}

		
					this.deleteComment.emit(this.timeline._id);
					this.takeDiscussionService.deletePost(data)
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
					
				}
				
			}

            

		} else {

		}

       
        
    }


	
	like(e: any) {

		e.stopPropagation()
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

	likeAnswer(e) {

		if (this.authService.isLoggedIn()) {
			if (this.userHasLiked(this.timeline)) {
				this.timeline.likedByUser = false;
				this.timeline.count -= 1;
				this.likesService.deleteLike('answer', this.parent, this.authService.currentUser._id, this.timeline);

			} else {
				this.timeline.likedByUser = true;
				this.timeline.count += 1;
				this.likesService.postLike('answer', this.parent, this.authService.currentUser._id, this.timeline);
			}
		}
	}

}
