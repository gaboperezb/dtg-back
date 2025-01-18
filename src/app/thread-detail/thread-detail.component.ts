import { Component, ElementRef, ViewChild, HostListener, Inject, Renderer2 } from '@angular/core';
import { IThread, ITimeline } from '../../app/shared/interfaces'
import { AuthService } from '../../app/core/auth.service';
import { ThreadsService } from '../../app/core/thread.service';
import { ThreadDiscussionService } from '../../app/core/thread-discussion.service';
import { ThreadLikesService } from '../../app/core/thread-likers.service';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { WebSocketService } from '../core/websocket.service';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { SeoSocialShareService } from '../core/seo-social-share.service';
import { GoogleAnalyticsService } from 'ngx-google-analytics';


/**
 * Generated class for the ThreadDetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */



@Component({
	selector: 'app-thread-detail',
	templateUrl: './thread-detail.component.html',
	styleUrls: ['./thread-detail.component.scss']
})

export class ThreadDetailComponent {

	sameUser: boolean = false;
	followingUser: boolean = false;
	offsetTopBack: any;
	showAside: boolean = false;
	sendingComment: boolean = false;
	toggleSort: boolean = false;
	comment: string = ""
	textareaFocused: boolean = false;
	errorMessage: string = "";
	threaddd: any;
	prueba: number = 0;
	thread: IThread;
	options: string[] = [];
	optionsWithPercentage: any[] = [];
	totalVotes: number;
	showResults: boolean = false;
	toggleShareAside: boolean = false;
	toggleShareBottom: boolean = false;
	voted: boolean = false;
	percentageSum: number = 0;
	timelines: ITimeline[] = [];
	hot: boolean = true;
	new: boolean = false;
	pollEffect: boolean = false;
	top: boolean = false;
	sortBy: string = "HOT";
	loadingDiscussions: boolean = true;
	editUrl: string = '/tabs/tab1';
	admin: boolean = false;
	loadingInitial: boolean = true;
	reactivateInfinite: any;
	skipHot: number = 0;
	skipNew: number = 0;
	skipTop: number = 0;
	loadingImage: boolean = true;
	opacityToCero: boolean = false;
	imageToDisplay: string;
	enableInfinite: boolean = false;
	loaderInstance: any;
	scrollTO: any;
	notificationInformation: any;
	loadingThread: boolean = false;
	scrollPosition: number;
	swipeTimeOut: any;
	showInfiniteSpinner: boolean = false;
	saved: boolean = false;


	constructor(
		private route: ActivatedRoute,
		public authService: AuthService,
		public threadsService: ThreadsService,
		private likesService: ThreadLikesService,
		private router: Router,
		private threadDiscussionService: ThreadDiscussionService,
		private seoSocialShareService: SeoSocialShareService,
		@Inject(PLATFORM_ID) private platformId: Object,
		private webSocketService: WebSocketService,
		private renderer: Renderer2,
		private $gaService: GoogleAnalyticsService,
		private el: ElementRef) {

	}


	ngOnInit() {

		this.renderer.addClass(document.body, 'white-body');
		this.$gaService.pageView('/post-detail', 'Post detail')

		this.route.data
			.subscribe((data) => {
				if (data.data.error) {
					this.authService.errorMessage = "Not found";
					if(isPlatformBrowser(this.platformId)) {
						setTimeout(() => {
							this.authService.errorMessage = null;
						}, 5000);
					}
				
				} else {
					this.configureThread(data.data.thread);
				}

			});
	}


	ngOnDestroy() {
		this.renderer.removeClass(document.body, 'white-body');
	}

	@HostListener("window:scroll", [])
	onWindowScroll() {

		if (window.pageYOffset >= 100) {
			if (!this.showAside) this.showAside = true;
		} else {
			if (this.showAside) this.showAside = false;
		}


	}


	sharePost(action: string) {

		let url = 'https://www.discussthegame.com/posts/' + this.thread._id
		if (action == "link") {

			const selBox = document.createElement('textarea');
			selBox.style.position = 'fixed';
			selBox.style.left = '0';
			selBox.style.top = '0';
			selBox.style.opacity = '0';
			selBox.value = url;
			document.body.appendChild(selBox);
			selBox.focus();
			selBox.select();
			document.execCommand('copy');
			document.body.removeChild(selBox);
			this.authService.successMessage = "Copied to clipboard!"
			setTimeout(() => {
				this.authService.successMessage = null
			}, 3000);

		}

		this.toggleShareAside = false;
		this.toggleShareBottom = false;

	}

	configureSEO() {

		let picture: string;
		if (this.thread.picture) {
			picture = this.thread.webPicture ? this.thread.webPicture : this.thread.picture
		}

		let data = {
			title: this.thread.title,
			description: this.thread.description,
			site: 'https://www.discussthegame.com/posts/' + this.thread._id,
			image: picture,
			large: true
		}
		this.seoSocialShareService.setData(data)
	}

	goAccess(type: string) {
		this.authService.toggleAccess = true;
		this.authService.register = true;

		if (type == 'login') this.authService.toggleLogin = true;
		else {
			this.authService.toggleLogin = false;
		}

	}

	ngAfterViewInit() {
		this.deleteEmptyTags()
	}

	savePost() {

		if (this.authService.isLoggedIn()) {
			if (this.saved) {
				const index = this.thread.bookmarks.indexOf(this.authService.currentUser._id)
				if (index > -1) {
					this.thread.bookmarks.splice(index, 1)
				}
                this.threadsService.deleteBookmark(this.thread._id)
				this.saved = false;
				
				this.authService.successMessage = 'Post Unsaved'
				setTimeout(() => {
					this.authService.successMessage = null;	
				}, 3000);
				
			} else {
				if(this.thread.bookmarks) this.thread.bookmarks.push(this.authService.currentUser._id);
				else {
					this.thread.bookmarks = [this.authService.currentUser._id];
                }
                this.saved = true; 
				this.threadsService.addToBookmarks(this.thread._id)
				this.authService.successMessage = 'Post saved'
				setTimeout(() => {
					this.authService.successMessage = null;	
				}, 3000);
			}
		} else {

			//Mandar a signup

			this.authService.toggleAccess = true;
			this.authService.register = true;
			this.authService.toggleLogin = false;
			

		}

	}

	followRelation() {

		if (this.authService.isLoggedIn()) {

			if (this.authService.currentUser.username == this.thread.user.username) {
				this.sameUser = true;

			} else {
				this.sameUser = false;
			}
			if (this.authService.currentUser.following.indexOf(this.thread.user._id) >= 0) {
				this.followingUser = true
			} else {
				this.followingUser = false
			}
		} else {
			this.followingUser = false
			this.sameUser = false;
		}

	}

	deleteEmptyTags() {

		if (isPlatformBrowser(this.platformId)) {
			var wrapper = document.querySelector('.thread-description');

			let test = wrapper.querySelectorAll('p')


			for (var p = 0; p < test.length; p++) {

				if (test[p].innerHTML === '<br>') {
					test[p].classList.add("empty")
				}
			}
		}


	}


	commentFocused() {
		this.textareaFocused = true;
	}


	commentUnfocused() {
		this.textareaFocused = false;
	}

	configureThread(thread: IThread) {

		thread.date = new Date(thread.date);
		thread.created = this.created(thread);
		thread.likedByUser = this.userHasLiked(thread);
		thread.count = thread.likers ? thread.likers.length : 0;

		this.thread = thread;
		this.saved = this.userHasSaved(this.thread);
		this.configureSEO();
		if (this.authService.isLoggedIn()) {
			if (this.authService.currentUser.username === this.thread.user.username || this.authService.currentUser.isAdmin) {
				this.showResults = true;
			}

		}

		if (this.thread.pollValues.length > 1) {
			this.options = this.thread.pollValues;

			this.totalVotes = this.thread.votes.length;
			this.userHasVoted();
		}
		else if (this.thread.abValues.length > 1) {

			this.options = this.thread.abValues;
			this.totalVotes = this.thread.votes.length;
			this.userHasVoted();
		}

		this.followRelation()
		if (isPlatformBrowser(this.platformId)) {
			setTimeout(() => {
				this.enableInfinite = true;
			}, 1000);

		}

	}

	followUser() {

		if (this.authService.isLoggedIn()) {

			if (this.followingUser) {
				//Unfollow
				this.followingUser = false;
				this.authService.currentUser.followingNumber -= 1;
				this.authService.currentUser.following = this.authService.currentUser.following.filter(element => element != this.thread.user._id);

				this.authService.unfollow(this.thread.user._id)
					.subscribe(() => {


					},
						(err) => {


						});

			} else {
				//Follow
				this.followingUser = true;
				this.authService.currentUser.followingNumber += 1;

				this.authService.currentUser.following.push(this.thread.user._id);
				this.authService.follow(this.thread.user._id)
					.subscribe(() => {
						this.webSocketService.emitPost(null, "follow", this.thread.user._id, this.authService.currentUser._id);
					},
						(err) => {
							this.authService.errorMessage = err;
							setTimeout(() => {
								this.authService.errorMessage = null;
							}, 5000);
						});

			}
		} else {

			//Mandar a signup

			this.authService.toggleAccess = true;
			this.authService.register = true;
			this.authService.toggleLogin = false;
		}

	}


	deleteComment(comment: string) {

		this.timelines = this.timelines.filter(timeline => timeline._id.toString() != comment.toString());

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

	onLoad() {

		this.loadingImage = false;
		this.thread.imageCached = true;
		this.setOpacitytoCero();

	}

	setOpacitytoCero() {

		setTimeout(() => {
			this.opacityToCero = true;
		}, 400);

	}

	goToUser() {
		this.renderer.removeClass(document.body, 'modal-open');
		this.router.navigate(['/u', this.thread.user.username]);

	}

	sendComment() {

		if (this.comment.length == 0) return
		if (this.authService.isLoggedIn()) {
			this.sendingComment = true;
			let data = {
				opinion: this.comment,
				threadUser: this.thread.user._id,
				playerIds: this.thread.user.playerIds

			}

			this.threadDiscussionService.postDiscussion(data, this.thread._id)
				.subscribe((timeline: ITimeline) => {
					this.webSocketService.emitPost(this.thread._id, "thread", this.thread.user._id, this.authService.currentUser._id)
					timeline.date = new Date(timeline.date)
					timeline.count = 0;
					timeline.created = "1min"
					this.timelines.unshift(timeline);

					this.sendingComment = false;
					this.comment = "";
					this.thread.replies += 1;
					setTimeout(() => {
						this.showVisible(null);
					}, 0);

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

	sortDiscussions(sortBy: string) {

		this.loadingDiscussions = true;
		if (sortBy == 'HOT') {
			this.sortBy = "HOT";
			this.threadsService.hot = true;
			this.threadsService.new = false;
			this.threadsService.top = false;

			this.hot = true;
			this.new = false;
			this.top = false;
			this.toggleSort = false;

			this.getDiscussions()



		} else if (sortBy == 'NEW') {
			this.sortBy = "NEW";
			this.threadsService.hot = false;
			this.threadsService.top = false;
			this.threadsService.new = true;

			this.hot = false;
			this.top = false;
			this.new = true;
			this.toggleSort = false;

			this.getNewestDiscussions()

		} else {
			this.sortBy = "TOP";
			this.threadsService.hot = false;
			this.threadsService.top = true;
			this.threadsService.new = false;

			this.hot = false;
			this.top = true;
			this.new = false;
			this.toggleSort = false;
			this.getTopDiscussions()

		}

	}



	getNewestDiscussions() {

		this.enableInfinite = false;
		this.skipNew = 0;
		if (this.reactivateInfinite) this.enableInfinite = true;
		this.loadingDiscussions = true;
		this.threadDiscussionService.getNewestDiscussions(this.thread._id, 0)
			.subscribe((timelines: any[]) => {
				timelines.forEach((timeline) => {
					timeline.date = new Date(timeline.date);
					timeline.created = this.created(timeline);
					timeline.likedByUser = this.userHasLiked(timeline);
				})
				this.timelines = timelines;
				this.loadingDiscussions = false;
				this.loadingInitial = false;
				if (this.timelines.length >= 25) this.enableInfinite = true;
				else {
					this.enableInfinite = false;
				}
				setTimeout(() => {
					this.showVisible(null);
				}, 0);

			},
				(err) => {
					this.loadingDiscussions = false;
					this.loadingInitial = false;
					this.enableInfinite = true;
					this.authService.errorMessage = err;
					setTimeout(() => {
						this.authService.errorMessage = null;
					}, 5000);

				})

	}

	getTopDiscussions() {


		this.enableInfinite = false;
		this.skipTop = 0;
		if (this.reactivateInfinite) this.enableInfinite = true;
		this.threadDiscussionService.getTopDiscussions(this.thread._id, 0)
			.subscribe((timelines: any[]) => {
				timelines.forEach((timeline) => {
					timeline.date = new Date(timeline.date);
					timeline.created = this.created(timeline);
					timeline.likedByUser = this.userHasLiked(timeline);

				})

				this.loadingDiscussions = false;
				this.loadingInitial = false;
				this.timelines = timelines;
				if (this.timelines.length >= 25) this.enableInfinite = true;
				else {
					this.enableInfinite = false;
				}


				setTimeout(() => {
					this.showVisible(null);
				}, 0);

			},
				(err) => {
					this.enableInfinite = true;
					this.loadingDiscussions = false;
					this.loadingInitial = false;
					this.authService.errorMessage = err;
					setTimeout(() => {
						this.authService.errorMessage = null;
					}, 5000);

				})
	}

	getDiscussions() {


		this.enableInfinite = false;
		this.skipHot = 0;
		if (this.reactivateInfinite) this.enableInfinite = true;

		this.threadDiscussionService.getDiscussions(this.thread._id, 0)
			.subscribe((timelines: any[]) => {
				timelines.forEach((timeline) => {
					timeline.date = new Date(timeline.date);
					timeline.created = this.created(timeline);
					timeline.likedByUser = this.userHasLiked(timeline);

				})

				this.loadingDiscussions = false;
				this.loadingInitial = false;
				this.timelines = timelines;

				if (this.timelines.length >= 25) this.enableInfinite = true;
				else {
					this.enableInfinite = false;
				}

				this.showInfiniteSpinner = false;

				setTimeout(() => {
					this.showVisible(null);
				}, 0);

			},
				(err) => {
					this.enableInfinite = true;
					this.loadingDiscussions = false;
					this.loadingInitial = false;
					this.authService.errorMessage = err;
					setTimeout(() => {
						this.authService.errorMessage = null;
					}, 5000);

				})
	}

	getMoreNewestDiscussions(skip: number) {

		this.loadingDiscussions = true;
		this.threadDiscussionService.getNewestDiscussions(this.thread._id, skip)
			.subscribe((timelines: any[]) => {
				timelines.forEach((timeline) => {
					timeline.date = new Date(timeline.date);
					timeline.created = this.created(timeline);
					timeline.likedByUser = this.userHasLiked(timeline);


				})
				let newTimelinesArray = this.timelines.concat(timelines);

				//Eliminar duplicados. Esto sucede porque continuamente se agregan discusiones a la base de datos; el skip genera esto.
				var unique = newTimelinesArray.filter((item, i, array) => {
					return array.findIndex((item2: any) => { return item2._id == item._id }) === i;
				})

				this.loadingDiscussions = false;

				if (timelines.length < 25) this.enableInfinite = false;


				this.timelines = unique;
				setTimeout(() => {
					this.showVisible(null);
				}, 0);
				this.showInfiniteSpinner = false;

			},
				(err) => {
					this.showInfiniteSpinner = false;
					this.loadingDiscussions = false;
					this.authService.errorMessage = err;
					setTimeout(() => {
						this.authService.errorMessage = null;
					}, 5000);

				})

	}

	getMoreTopDiscussions(skip: number) {


		this.loadingDiscussions = true;
		this.threadDiscussionService.getTopDiscussions(this.thread._id, skip)
			.subscribe((timelines: any[]) => {
				timelines.forEach((timeline) => {
					timeline.date = new Date(timeline.date);
					timeline.created = this.created(timeline);
					timeline.likedByUser = this.userHasLiked(timeline);


				})
				let newTimelinesArray = this.timelines.concat(timelines);

				//Eliminar duplicados. Esto sucede porque continuamente se agregan discusiones a la base de datos; el skip genera esto.
				var unique = newTimelinesArray.filter((item, i, array) => {
					return array.findIndex((item2: any) => { return item2._id == item._id }) === i;
				})
				this.timelines = unique;
				this.loadingDiscussions = false;
				if (timelines.length < 25) this.enableInfinite = false;
				setTimeout(() => {
					this.showVisible(null);
				}, 0);

			},
				(err) => {
					this.showInfiniteSpinner = false;
					this.loadingDiscussions = false;
					this.authService.errorMessage = err;
					setTimeout(() => {
						this.authService.errorMessage = null;
					}, 5000);

				})
	}

	getMoreDiscussions(skip: number) {

		this.loadingDiscussions = true;
		this.threadDiscussionService.getDiscussions(this.thread._id, skip)
			.subscribe((timelines: any[]) => {
				timelines.forEach((timeline) => {
					timeline.date = new Date(timeline.date);
					timeline.created = this.created(timeline);
					timeline.likedByUser = this.userHasLiked(timeline);
				})

				let newTimelinesArray = this.timelines.concat(timelines);

				//Eliminar duplicados. Esto sucede porque continuamente se agregan discusiones a la base de datos; el skip genera esto.
				var unique = newTimelinesArray.filter((item, i, array) => {
					return array.findIndex((item2: any) => { return item2._id == item._id }) === i;
				})
				this.timelines = unique;
				this.loadingDiscussions = false;

				if (timelines.length < 25) this.enableInfinite = false;
				setTimeout(() => {
					this.showVisible(null);
				}, 0);
				this.showInfiniteSpinner = false;

			},
				(err) => {

					this.showInfiniteSpinner = false;
					this.loadingDiscussions = false;
					this.authService.errorMessage = err;
					setTimeout(() => {
						this.authService.errorMessage = null;
					}, 5000);

				})
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

	userHasVoted() {

		if (this.authService.isLoggedIn()) {
			if (this.threadsService.userHasVoted(this.thread, this.authService.currentUser._id) || this.showResults) {
				this.calculatePercentage(false);
			}
		}



	}


	calculatePercentage(makeEffect: boolean) {

		this.optionsWithPercentage = [];
		for (let i = 0; i < this.options.length; i++) {
			this.optionsWithPercentage.push(this.createOptionsObject(i));
		}

		let diffTo100 = 100 - this.percentageSum;
		if (diffTo100 != 0) {
			let provisionalArray = this.optionsWithPercentage.concat();
			provisionalArray.sort((a, b) => {
				return b.decimal - a.decimal;
			});


			for (let i = 0; i < diffTo100; i++) {
				for (let j = 0; j < this.optionsWithPercentage.length; j++) {
					if (this.optionsWithPercentage[j].option == provisionalArray[i].option) {
						this.optionsWithPercentage[j].flooredPercentage += 1;

					}
				}

			}
		}

		this.voted = true;



	}



	createOptionsObject(i: number) {

		let option = this.options[i].trim();
		let provArray = this.thread.votes.filter(i => i.option.trim() == option)
		let totalVotesOfOption = provArray.length;
		let userInOption = provArray.some((voter: any) => voter.user == this.authService.currentUser._id); //ID

		let percentage = (totalVotesOfOption / this.totalVotes) * 100;
		let decimal = percentage % 1
		let flooredPercentage = Math.floor(percentage);

		this.percentageSum += flooredPercentage;

		let object = {
			option: option,
			percentage: percentage,
			decimal: decimal,
			flooredPercentage: isNaN(flooredPercentage) ? 0 : flooredPercentage,
			userInOption: userInOption
		}


		return object;
	}



	toggleVote(value: string) {

		if (this.authService.isLoggedIn() && this.options.length > 1) {
			this.pollEffect = true;
			if (!this.threadsService.userHasVoted(this.thread, this.authService.currentUser._id)) {
				setTimeout(() => { this.voted = true; }, 700);
				this.totalVotes += 1;
				this.threadsService.postVote(this.thread, value);
				let objectToPush = {
					option: value,
					user: this.authService.currentUser._id
				}
				this.thread.votes.push(objectToPush);
				this.calculatePercentage(true);

			}

		} else {

			//Mandar a registrar

			this.authService.toggleAccess = true;
			this.authService.register = true;
			this.authService.toggleLogin = false;
		}

	}


	openLink() {

	}


	replyDetail(timeline: ITimeline) {

	}


	//Thread
	like() {

		if (this.authService.isLoggedIn()) {
			if (this.userHasLiked(this.thread)) {
				this.thread.likedByUser = false;
				this.thread.count -= 1;
				if (this.threadsService.currentThread) this.threadsService.currentThread.likedByUser = false;
				if (this.threadsService.currentThread) this.threadsService.currentThread.count -= 1;
				this.likesService.deleteThreadLike(this.thread, this.authService.currentUser._id);

			} else {
				this.thread.likedByUser = true;
				this.thread.count += 1;
				if (this.threadsService.currentThread) this.threadsService.currentThread.likedByUser = true;
				if (this.threadsService.currentThread) this.threadsService.currentThread.count += 1;
				this.likesService.postThreadLike(this.thread, this.authService.currentUser._id);

			}

		}
		else {
			//Mandar a signup

			this.authService.toggleAccess = true;
			this.authService.register = true;
			this.authService.toggleLogin = false;

		}
	}

	userHasSaved(thread: IThread) {

		if (this.authService.currentUser && thread.bookmarks) {
			return thread.bookmarks.some((user: any) => user === this.authService.currentUser._id);
		} else {
			return false;
		}
	}


	//Thread
	userHasLiked(thread: IThread) {
		if (this.authService.isLoggedIn()) {
			return this.likesService.userHasLiked(thread, this.authService.currentUser._id);
		} else {
			return false;
		}
	}


	doInfinite() {

		if (this.showInfiniteSpinner) return;

		this.showInfiniteSpinner = true;
		if (this.timelines.length == 0) {
		
			this.getDiscussions()
			return;
		}
		if (this.hot) {
			this.skipHot += 25;
			this.getMoreDiscussions(this.skipHot);
		} else if (this.new) {
			this.skipNew += 25;
			this.getMoreNewestDiscussions(this.skipNew);

		} else {
			this.skipTop += 25;
			this.getMoreTopDiscussions(this.skipTop);
		}

	}

}

