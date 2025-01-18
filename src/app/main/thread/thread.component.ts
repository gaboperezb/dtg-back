import { Component, OnInit, Input, Output, EventEmitter  } from '@angular/core';
import { ITake, IThread } from 'src/app/shared/interfaces';
import { AuthService } from 'src/app/core/auth.service';
import { ThreadLikesService } from 'src/app/core/thread-likers.service';
import { LikesService } from 'src/app/core/likers.service';
import { Router } from '@angular/router';
import { ThreadsService } from 'src/app/core/thread.service';
import * as _ from 'lodash';


@Component({
	selector: 'app-thread',
	templateUrl: './thread.component.html',
	styleUrls: ['./thread.component.scss']
})
export class ThreadComponent implements OnInit {

	@Input() thread: IThread;
	@Input() i: number;
	@Output() deleteThread = new EventEmitter();
	toggleEdit: boolean = false;
	showViews: boolean = false;

	constructor(public authService: AuthService,
		private router: Router,
		private threadsService: ThreadsService,
		private threadLikesService: ThreadLikesService,
		private likesService: LikesService) { }

	ngOnInit() {
		let path = this.router.url.split('/')
		if (path[1] == 'u' && this.authService.currentUser && this.authService.currentUser.username == this.thread.user.username) this.showViews = true;
	}

	goAccess(type: string) {
		this.authService.toggleAccess = true;
		this.authService.register = true;

		if (type == 'login') this.authService.toggleLogin = true;
		else {
			this.authService.toggleLogin = false;
		}

	}

	toggleMoreOptions(e: any) {
		e.stopPropagation()
		this.toggleEdit = !this.toggleEdit;
	}

	editPost(e: any) {

		this.toggleEdit = false;
		e.stopPropagation()
		if(this.thread.fromWeb) {
			this.threadsService.threadToEdit = _.cloneDeep(this.thread);
			this.threadsService.threadToEditOriginal = this.thread;
			this.router.navigateByUrl('/create-post');
		} else {
			alert('This post was created in the DTG app, please go there to edit it.')
		}
	}

	deletePost(e: any) {

		this.toggleEdit = false;
		e.stopPropagation()
		var r = confirm("Do you want to delete this post");
		if (r == true) {

			let data = {
				tId: this.thread._id,
				userId: this.authService.currentUser._id
			}
			this.deleteThread.emit(this.thread._id);
			this.threadsService.deleteThread(data)
				.subscribe((success) => {
					if (success) {
						
					} else {

						this.authService.errorMessage = 'Could not delete post. Please try again later'
						setTimeout(() => {
							this.authService.errorMessage = null;
						}, 3000);

					}
				},
					(err) => {
						this.authService.errorMessage = 'Could not delete post. Please try again later'
						setTimeout(() => {
							this.authService.errorMessage = null;
						}, 3000);
					});

		} else {

		}

		

	}




	itemTapped($event) {

		this.threadsService.currentThread = this.thread;
		this.router.navigate(['/posts', this.thread._id]);

	}

	goToUser(event) {
		event.stopPropagation()
		this.router.navigate(['/u', this.thread.user.username]);
	}

	like(e: any) {

		e.stopPropagation()


		if (this.authService.isLoggedIn()) {

			if (this.userHasLiked(this.thread)) {
				this.thread.likedByUser = false;
				this.thread.count -= 1;
				this.threadLikesService.deleteThreadLike(this.thread, this.authService.currentUser._id);

			} else {
				this.thread.likedByUser = true;
				this.thread.count += 1;
				this.threadLikesService.postThreadLike(this.thread, this.authService.currentUser._id);

			}
		}
		else {
			//Mandar a signup
			this.authService.toggleAccess = true;
			this.authService.register = true;
			this.authService.toggleLogin = false;



		}
	}

	userHasLiked(thread: IThread) {

		if (this.authService.currentUser) {
			return this.likesService.userHasLiked(thread, this.authService.currentUser._id);
		} else {
			return false;
		}
	}

}
