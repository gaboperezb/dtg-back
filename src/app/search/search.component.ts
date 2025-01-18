import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { IThread } from '../shared/interfaces';
import { AuthService } from '../core/auth.service';
import { ThreadsService } from '../core/thread.service';
import { LikesService } from '../core/likers.service';
import { ActivatedRoute } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Component({
	selector: 'app-search',
	templateUrl: './search.component.html',
	styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

	searchToggled: boolean = false;
	searching: boolean = true;
	posts: boolean = true;
	skipThreads: number = 0;
	skipUsers: number = 0;
	threads: IThread[] = [];
	notFound: boolean = false;
	enableInfinite: boolean = false;
	enableInfiniteUsers: boolean = false;
	searchTerm: string = "";
	trimSearchTerm: string = "";
	users: any[] = [];
	loadingChats: boolean = true;
	chats: any[] = [];
	sortBy: string = "sports";
	showInfiniteSpinner: boolean = false;
	showInfiniteSpinnerUsers: boolean = false;
	fetching: boolean = true;
	allUsers: boolean = false;

	constructor(
		private route: ActivatedRoute,
		@Inject(PLATFORM_ID) private platformId: Object,
		private authService: AuthService,
		private threadsService: ThreadsService,
		private likesService: LikesService) { }

	ngOnInit(): void {


		this.route.queryParamMap.subscribe(query => {
			let type=query.get('type')
			this.searchTerm = query.get('q')
			this.trimSearchTerm = this.searchTerm.replace(/ /g, '');
			if(type == 'users') {
				if(this.authService.isLoggedIn()) this.searchAllUsers();
				else {
					this.searchAllUsersLoggedOut()
				}
			
			} else {
			
				this.searchPosts(this.searchTerm)

				if(this.authService.isLoggedIn()) this.searchUsers();
				else {
					this.searchUsersLoggedOut()
				}
			
				this.allUsers = false;
			}
		})


	}

	deleteThread(threadId: string) {
        this.threads = this.threads.filter(_thread => _thread._id !== threadId);
    }

	searchAllUsers() {

		this.skipUsers = 0;
		this.authService.searchUsers(this.trimSearchTerm, this.skipUsers)
			.subscribe((users: any[]) => {

				if (this.authService.isLoggedIn()) {
					let usersF = users.filter(user => user._id != this.authService.currentUser._id);
					this.users = usersF
				} else {
					this.users = users
				}
				this.searching = false;

				if (users.length < 20) this.enableInfiniteUsers = false;
				else {
					this.enableInfiniteUsers = true;
				}
				this.threads = []
				this.allUsers = true;
				this.showInfiniteSpinnerUsers = false;
			

			},
				(err) => {

					this.searching = false;
					this.showInfiniteSpinnerUsers = false;
					this.authService.errorMessage = err;
					if(isPlatformBrowser(this.platformId)) {
						setTimeout(() => {
							this.authService.errorMessage = null;
						}, 5000);
					}
					
				})

	}


	searchUsers() {

		this.skipUsers = 0;

		this.authService.searchUsers(this.trimSearchTerm, this.skipUsers)
			.subscribe((users: any[]) => {

		
	

				if (this.authService.isLoggedIn()) {
					let usersF = users.filter(user => user._id != this.authService.currentUser._id);
					usersF.splice(5);
					this.users = usersF
				} else {

					users.splice(5)
					this.users = users
					
				}
				this.searching = false;

				if (users.length < 20) this.enableInfiniteUsers = false;
				else {
					this.enableInfiniteUsers = true;
				}
				this.showInfiniteSpinnerUsers = false;
			

			},
				(err) => {

					this.searching = false;
					this.showInfiniteSpinnerUsers = false;
					this.authService.errorMessage = err;

					if(isPlatformBrowser(this.platformId)) {
						setTimeout(() => {
							this.authService.errorMessage = null;
						}, 5000);
					}
					
				})

	}

	searchAllUsersLoggedOut() {

		this.skipUsers = 0;
		this.authService.searchUsersLoggedOut(this.trimSearchTerm, this.skipUsers)
			.subscribe((users: any[]) => {

				if (this.authService.isLoggedIn()) {
					let usersF = users.filter(user => user._id != this.authService.currentUser._id);
					this.users = usersF
				} else {
					this.users = users
				}
				this.searching = false;

				if (users.length < 20) this.enableInfiniteUsers = false;
				else {
					this.enableInfiniteUsers = true;
				}
				this.threads = []
				this.allUsers = true;
				this.showInfiniteSpinnerUsers = false;
			

			},
				(err) => {

					this.searching = false;
					this.showInfiniteSpinnerUsers = false;
					this.authService.errorMessage = err;

					if(isPlatformBrowser(this.platformId)) {
						setTimeout(() => {
							this.authService.errorMessage = null;
						}, 5000);
					}

				})

	}


	searchUsersLoggedOut() {

		this.skipUsers = 0;
		this.authService.searchUsersLoggedOut(this.trimSearchTerm, this.skipUsers)
			.subscribe((users: any[]) => {

		
	

				if (this.authService.isLoggedIn()) {
					let usersF = users.filter(user => user._id != this.authService.currentUser._id);
					usersF.splice(5);
					this.users = usersF
				} else {

					users.splice(5)
					this.users = users
					
				}
				this.searching = false;

				if (users.length < 20) this.enableInfiniteUsers = false;
				else {
					this.enableInfiniteUsers = true;
				}
				this.showInfiniteSpinnerUsers = false;
			

			},
				(err) => {

					this.searching = false;
					this.showInfiniteSpinnerUsers = false;
					this.authService.errorMessage = err;

					if(isPlatformBrowser(this.platformId)) {
						setTimeout(() => {
							this.authService.errorMessage = null;
						}, 5000);
					}
					
					


				})

	}

	searchMoreUsers() {

		this.authService.searchUsers(this.trimSearchTerm, this.skipUsers)
			.subscribe((users: any) => {

				if (this.authService.isLoggedIn()) {
					let usersF = users.filter(user => user._id != this.authService.currentUser._id);
					this.users = this.users.concat(usersF);
				} else {
					this.users = this.users.concat(users);
				}


				if (users.length < 20) this.enableInfiniteUsers = false;
				else {
					this.enableInfiniteUsers = true
				}
				this.showInfiniteSpinnerUsers = false;

			},
				(err) => {

					this.showInfiniteSpinnerUsers = false;
					this.authService.errorMessage = err;

					if(isPlatformBrowser(this.platformId)) {
						setTimeout(() => {
							this.authService.errorMessage = null;
						}, 5000);
					}
				})

	}


	searchPosts(value: string) {

		this.skipThreads = 0;
		this.threadsService.searchThreads(value, this.skipThreads)
			.subscribe((threads: any) => {
				if (threads.length == 0) this.notFound = true;
				let prov = threads.map((thread: any) => {
					thread.date = new Date(thread.date);
					thread.created = this.created(thread);
					thread.likedByUser = this.userHasLiked(thread);
					thread.count = thread.likers ? thread.likers.length : 0;
					thread.levelN = thread.user.badge.picture.replace('.png', 'N.png');

					return thread;
				})

				this.searching = false;
				if (threads.length < 10) this.enableInfinite = false
				else {
					this.enableInfinite = true
				}
				this.threads = prov;


			},
				(err) => {

			
					this.showInfiniteSpinner = false;
					this.authService.errorMessage = err;

					if(isPlatformBrowser(this.platformId)) {
						setTimeout(() => {
							this.authService.errorMessage = null;
						}, 5000);
					}
					

				})

	}

	searchMorePosts() {

		this.threadsService.searchThreads(this.searchTerm, this.skipThreads)
			.subscribe((threads: any) => {
				let prov = threads.map((thread: any) => {
					thread.date = new Date(thread.date);
					thread.created = this.created(thread);
					thread.likedByUser = this.userHasLiked(thread);
					thread.count = thread.likers ? thread.likers.length : 0;
					thread.levelN = thread.user.badge.picture.replace('.png', 'N.png');

					return thread;
				})
				if (threads.length < 10) this.enableInfinite = false
				else {
					this.enableInfinite = true
				}
				this.threads = this.threads.concat(prov);
				this.showInfiniteSpinner = false;
				
			},
				(err) => {
					this.showInfiniteSpinner = false;
					this.authService.errorMessage = err;

					if(isPlatformBrowser(this.platformId)) {
						setTimeout(() => {
							this.authService.errorMessage = null;
						}, 5000);
					}
					

				})



	}

	created(thread: IThread): string {

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

	userHasLiked(thread: IThread) {

		if (this.authService.currentUser) {
			return this.likesService.userHasLiked(thread, this.authService.currentUser._id);
		} else {
			return false;
		}
	}


	doInfinite() {

		
        if (this.showInfiniteSpinner) return;
		this.showInfiniteSpinner = true;
		this.skipThreads += 10;
		this.searchMorePosts();
	


	}


	doInfiniteUsers() {

		
        if (this.showInfiniteSpinnerUsers) return;
		this.showInfiniteSpinnerUsers = true;
		this.skipUsers += 20;
		this.searchMoreUsers();
	


	}

}
