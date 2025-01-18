import { Component, OnInit, ElementRef, ViewChild, HostListener, PLATFORM_ID, Inject } from '@angular/core';
import { Location, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ITake, ITimeline } from '../shared/interfaces';
import { AuthService } from '../core/auth.service';
import { TakeService } from '../core/take.service';
import { LikesService } from '../core/likers.service';
import { TakeDiscussionService } from '../core/take-discussion.service';
import { InViewportMetadata } from 'ng-in-viewport';
import { TakeLikesService } from '../core/take-likers.service';
import { ThreadDiscussionService } from '../core/thread-discussion.service';
import { WebSocketService } from '../core/websocket.service';
import { isNumber } from 'util';
import { StateService } from '../core/state.service';
import { SeoSocialShareService } from '../core/seo-social-share.service';
import { ThreadsService } from '../core/thread.service';
import { GoogleAnalyticsService } from 'ngx-google-analytics';

@Component({
	selector: 'app-take-detail',
	templateUrl: './take-detail.component.html',
	styleUrls: ['./take-detail.component.scss'],
})
export class TakeDetailComponent implements OnInit {



	toggleShareBottom: boolean = false;
	sticky: boolean = false;
	sendingComment: boolean = false;
	comment: string = ""
	textareaFocused: boolean = false;
	toggleSort: boolean = false;
	swipeTimeOut: any;
	showTimer: boolean = false;
	largeLink: boolean = false;
	take: ITake;
	notificationInformation: any;
	loadingTake: boolean = false;
	enableInfinite: boolean = false;
	skipHot: number = 0;
	skipNew: number = 0;
	skipTop: number = 0;
	reactivateInfinite: any;
	timeInterval: any;
	loadingDiscussions: boolean = true;
	loadingInitial: boolean = true;
	timelines: ITimeline[] = [];
	admin: boolean = false;
	videoPaused: boolean = true;
	dontPlay: boolean = false;
	displayTimeTimeout: any;
	time: string;
	notLoaded: boolean = true;
	videoLoaded: boolean = false;
	hot: boolean = true;
	new: boolean = false;
	sortBy: string = "HOT";
	top: boolean = false;
	videoStyle: any;
	pictureStyle: any;
	viewEntered: boolean = false;
	@ViewChild('videoTake') videoTake: ElementRef;
	@ViewChild('back') backElement: ElementRef;
	offsetTopBack: any;
	showInfiniteSpinner: boolean = false;

	options: string[] = [];
	showResults: boolean = false;
	optionsWithPercentage: any[] = [];
	percentageSum: number = 0;
	totalVotes: number = 0;
	voted: boolean = false;
	pollEffect: boolean = false;

	constructor(private route: ActivatedRoute,
		private el: ElementRef,
		private location: Location,
		@Inject(PLATFORM_ID) private platformId: Object,
		private threadDiscussionService: ThreadDiscussionService,
		public authService: AuthService,
		private stateService: StateService,
		private $gaService: GoogleAnalyticsService,
		private takeDiscussionService: TakeDiscussionService,
		public takeService: TakeService,
		private router: Router,
		private seoSocialShareService: SeoSocialShareService,
		private webSocketService: WebSocketService,
		private takeLikesService: TakeLikesService,
		private threadsService: ThreadsService,
		private likesService: LikesService) {


	}


	ngOnDestroy() {

		if (this.take && this.take.video) this.unloadVideo();

	}

	cutShareText() {

		var limit = 140;
		let reducedText = this.take.take.substring(0, limit);
		if (reducedText.length < this.take.take.length) {
			return this.take.take.substring(0, limit) + "...";
		} else {
			return this.take.take
		}

	}

	commentFocused() {
		this.textareaFocused = true;
	}


	goBack() {
		if (this.takeService.takes.length || this.threadsService.threads.length) this.location.back();
		else {
			this.router.navigate(['../'])
		}
	}


	commentUnfocused() {
		this.textareaFocused = false;
	}


	checkSticky() {
		if (window.pageYOffset > this.offsetTopBack) {
			if (!this.sticky) this.sticky = true
		} else {
			if (this.sticky) this.sticky = false
		}
	}

	// When the user scrolls the page, execute myFunction

	@HostListener("window:scroll", [])
	onWindowScroll() {
		this.checkSticky()

	}


	ngAfterViewInit() {

		if (isPlatformBrowser(this.platformId)) this.offsetTopBack = this.backElement.nativeElement.offsetTop - 55;

	}

	goToUser() {

		this.router.navigate(['/u', this.take.user.username]);
	}

	loadVideo() {

		if (isPlatformBrowser(this.platformId)) {
			this.videoTake.nativeElement.pause();
			this.videoTake.nativeElement.src = this.take.video; // empty source
			this.videoTake.nativeElement.load();
			this.videoLoaded = true;
		}

	}

	unloadVideo() {

		if (isPlatformBrowser(this.platformId)) {
			this.videoTake.nativeElement.pause();
			this.videoTake.nativeElement.src = ""; // empty source
			this.videoTake.nativeElement.load();
			this.videoLoaded = false;
		}

	}

	ngOnInit() {

		this.$gaService.pageView('/take-detail', 'Take detail')

		this.route.data
			.subscribe((data) => {

				if (data.data.error) {
					this.authService.errorMessage = "Not found";

					if (isPlatformBrowser(this.platformId)) {
						setTimeout(() => {
							this.authService.errorMessage = null;
						}, 5000);
					}


				} else {

					this.configureTake(data.data.take);
					if (isPlatformBrowser(this.platformId)) {
						this.getDiscussions();
					}
					if (this.take.video) {
						this.setVideoContainerStyle();
					}
					else if (this.take.picture) {
						this.setPictureContainerStyle()
					}
					if (this.authService.isLoggedIn()) {
						if (this.authService.currentUser.isAdmin) this.admin = true;
					}

				}

			});
	}


	sharePost(action: string) {

		let url = 'https://www.discussthegame.com/discussions/' + this.take._id
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


		this.toggleShareBottom = false;

	}
	configureSEO() {

		let picture: string;
		let data;
		if (this.take.picture) {
			picture = this.take.picture
			data = {
				title: this.take.take,
				description: this.take.league + ' discussion by u/' + this.take.user.username,
				site: 'https://www.discussthegame.com/discussions/' + this.take._id,
				image: picture,
				large: true
			}
		} else {
			data = {
				title: this.take.take,
				description: this.take.league + ' discussion by u/' + this.take.user.username,
				site: 'https://www.discussthegame.com/discussions/' + this.take._id,
				image: "https://discussthegame.s3-us-west-1.amazonaws.com/ui/dtg-share.png",
				large: false
			}

		}

		this.seoSocialShareService.setData(data)
	}

	configureTake(take: ITake) {
		take.date = new Date(take.date);
		take.created = this.created(take);
		take.likedByUser = this.userHasLiked(take);
		take.count = take.likers ? take.likers.length : 0;
		this.take = take;
		this.configureSEO()

		if (this.take.type == 'Link') {

			if (this.take.thumbnail_width > 500 && this.take.provider_name != 'Twitter' && this.take.urlType != 'video') {

				this.cutURLText(80)

			} else {

				this.cutURLText(60)

			}
		}

		if (this.take.type == "Poll") {
			if (this.authService.isLoggedIn()) {
				if (this.authService.currentUser.username === this.take.user.username) {
					this.showResults = true;
				}
			}
			this.options = this.take.pollValues;
			this.totalVotes = this.take.votes.length;
			this.userHasVoted();
		}
	}



	userHasVoted() {

		if (this.authService.isLoggedIn()) {
			if (this.takeService.userHasVoted(this.take, this.authService.currentUser._id) || this.showResults) {
				this.calculatePercentage(false);
			}
		}
	}

	createOptionsObject(i: number) {

		let option = this.options[i].trim();
		let provArray = this.take.votes.filter(i => i.option.trim() == option)
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

	calculatePercentage(makeEffect: boolean) {

		this.take.optionsWithPercentage = [];
		if (this.takeService.currentTake) this.takeService.currentTake.optionsWithPercentage = [];
		for (let i = 0; i < this.options.length; i++) {
			this.take.optionsWithPercentage.push(this.createOptionsObject(i));
			if (this.takeService.currentTake) this.takeService.currentTake.optionsWithPercentage.push(this.createOptionsObject(i));
		}

		let diffTo100 = 100 - this.percentageSum;
		if (diffTo100 != 0) {
			let provisionalArray = this.take.optionsWithPercentage.concat();
			provisionalArray.sort((a, b) => {
				return b.decimal - a.decimal;
			});


			for (let i = 0; i < diffTo100; i++) {
				for (let j = 0; j < this.take.optionsWithPercentage.length; j++) {
					if (this.take.optionsWithPercentage[j].option == provisionalArray[i].option) {
						this.take.optionsWithPercentage[j].flooredPercentage += 1;
						if (this.takeService.currentTake) this.takeService.currentTake.optionsWithPercentage[j].flooredPercentage += 1;

					}
				}

			}
		}

		this.take.voted = true;
		if (this.takeService.currentTake) this.takeService.currentTake.voted = true;
	}

	toggleVote(value: string, event: any) {

		event.stopPropagation()
		if (this.authService.isLoggedIn() && this.options.length > 1) {
			this.pollEffect = true;
			if (!this.takeService.userHasVoted(this.take, this.authService.currentUser._id)) {
				setTimeout(() => { this.take.voted = true; }, 700);
				this.totalVotes += 1;
				this.takeService.postVote(this.take._id, value);
				let objectToPush = {
					option: value,
					user: this.authService.currentUser._id
				}
				if (this.takeService.currentTake) this.takeService.currentTake.votes.push(objectToPush);
				this.take.votes.push(objectToPush);
				this.calculatePercentage(true);
				setTimeout(() => {
					this.pollEffect = false;
				}, 2000);

			}

		} else {

			//Mandar a signup
			this.authService.toggleAccess = true;
			this.authService.register = true;
			this.authService.toggleLogin = false;
		}

	}

	onIntersection($event) {



		const { [InViewportMetadata]: { entry }, target } = $event;
		const ratio = entry.intersectionRatio;
		const vid = target;

		if (ratio >= 0.02) {

			this.dontPlay = false;
			if (this.take.videoCurrentTime) vid.currentTime = this.take.videoCurrentTime;
			if (!this.videoLoaded) this.loadVideo();

		} else {

			this.dontPlay = true; //a veces no se pone pausa por el hack cuando te sales de fullscreen para que se vuelva a reproducir
			vid.currentTime = 0;
			if (this.videoLoaded) this.unloadVideo();



		}


	}

	sortDiscussions(sortBy: string) {

		this.loadingDiscussions = true;
		if (sortBy == 'HOT') {
			this.sortBy = "HOT";

			this.hot = true;
			this.new = false;
			this.top = false;
			this.toggleSort = false;

			this.getDiscussions()

		} else if (sortBy == 'NEW') {
			this.sortBy = "NEW";

			this.hot = false;
			this.top = false;
			this.new = true;
			this.toggleSort = false;

			this.getNewestDiscussions()

		} else {
			this.sortBy = "TOP";
			this.hot = false;
			this.top = true;
			this.new = false;
			this.toggleSort = false;
			this.getTopDiscussions()
		}

	}

	syncVideoTime(vid: any) {
		if (this.take.videoCurrentTime) vid.currentTime = this.take.videoCurrentTime;
	}

	deleteComment(comment: string) {
		this.timelines = this.timelines.filter(timeline => timeline._id.toString() != comment.toString());
	}

	goAccess(type: string) {
		this.authService.toggleAccess = true;
		this.authService.register = true;

		if (type == 'login') this.authService.toggleLogin = true;
		else {
			this.authService.toggleLogin = false;
		}

	}

	saveDiscussion(e: any) {

		e.stopPropagation()

		if (this.authService.isLoggedIn()) {
			if (this.take.saved) {
				const index = this.take.bookmarks.indexOf(this.authService.currentUser._id)
				if (index > -1) {
					this.take.bookmarks.splice(index, 1)
				}
				this.takeService.deleteBookmark(this.take._id)
				this.take.saved = false;

				this.authService.successMessage = 'Discussion unsaved'
				setTimeout(() => {
					this.authService.successMessage = null;
				}, 30000);

			} else {
				if (this.take.bookmarks) this.take.bookmarks.push(this.authService.currentUser._id);
				else {
					this.take.bookmarks = [this.authService.currentUser._id];
				}
				this.take.saved = true;
				this.takeService.addToBookmarks(this.take._id)
				this.authService.successMessage = 'Discussion saved'
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

	getDiscussions() {

		this.enableInfinite = false;
		this.skipHot = 0;

		this.takeDiscussionService.getDiscussions(this.take._id, 0)
			.subscribe((timelines: any[]) => {


				timelines.forEach((timeline) => {
					timeline.date = new Date(timeline.date);
					timeline.created = this.created(timeline);
					timeline.likedByUser = this.userHasLiked(timeline);

				})

				this.timelines = timelines;
				this.loadingInitial = false;
				this.loadingDiscussions = false;


				if (this.timelines.length >= 25) this.enableInfinite = true;
				else {
					this.enableInfinite = false;
				}



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

	getNewestDiscussions() {

		this.enableInfinite = false;
		this.skipNew = 0;
		if (this.reactivateInfinite) this.enableInfinite = true;

		this.takeDiscussionService.getNewestDiscussions(this.take._id, 0)
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
		this.takeDiscussionService.getTopDiscussions(this.take._id, 0)
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

	cutURLText(limit: number) {

		if (this.take.urlTitle) {
			let reducedText = this.take.urlTitle.substring(0, limit);
			if (reducedText.length < this.take.urlTitle.length) {
				this.take.reducedTitle = this.take.urlTitle.substring(0, limit) + "...";
			} else {
				this.take.reducedTitle = this.take.urlTitle
			}
		}



	}


	public changeVideoAudio(id: string, e) {

		e.stopPropagation();
		let vid: any = document.getElementById('media-' + id);
		if (vid.muted) {
			e.preventDefault();
		}
		this.fullVideo(vid);

	}

	fullVideo(vid: any) {

		vid.muted = false;
		this.videoPaused = false;
		this.notLoaded = false;
	}

	fullSizePicture(e: any) {
		e.stopPropagation();
		this.takeService.fullScreen = true;
		this.takeService.fullScreenImage = this.take.picture;
		this.stateService.freezeBody();
	}

	openLink(e: any) {

		e.stopPropagation()
		window.open(this.take.url, "_blank");

	}

	isVisible(elem) {

		if (elem) {
			let coords = elem.getBoundingClientRect();

			let windowHeight = document.documentElement.clientHeight;

			// top elem edge is visible OR bottom elem edge is visible
			let topVisible = coords.top > 0 && coords.top < windowHeight;
			let bottomVisible = coords.bottom < windowHeight && coords.bottom > 0;

			return topVisible || bottomVisible;
		}

	}
	onPause($event) {

		clearInterval(this.timeInterval);

		let vid = $event.target;

		this.videoPaused = true;
		clearInterval(this.displayTimeTimeout)

		this.displayTimeTimeout = setTimeout(() => {
			this.showTimer = false;
		}, 6000);

	}


	onPlay($event) {

		let vid = $event.target;
		this.videoPaused = false;


		clearTimeout(this.displayTimeTimeout)
		this.showTimer = true;
		this.displayTimeTimeout = setTimeout(() => {
			this.showTimer = false;
		}, 6000);


	}



	pad(num, size) {
		return ('000' + num).slice(size * -1);
	}

	sec2time(timeInSeconds: any) {

		let time = parseFloat(timeInSeconds).toFixed(3);
		let hours = Math.floor(Number(time) / 60 / 60),
			minutes = Math.floor(Number(time) / 60) % 60,
			seconds = Math.floor(Number(time) - minutes * 60),
			milliseconds = time.slice(-3);

		return this.pad(minutes, 2).charAt(1) + ':' + this.pad(seconds, 2)
	}




	public playIconClicked(id: string, e: any) {

		e.stopPropagation();
		let vid: any = document.getElementById('media-' + id);
		vid.play()
		if (vid.muted) {
			e.preventDefault();
		}
		this.fullVideo(vid);

	}


	onMetadata($event) {

		let vid = $event.target;
		this.syncVideoTime(vid);
		this.showTimer = true;
		this.displayTimeTimeout = setTimeout(() => {
			this.showTimer = false;
		}, 4000);
	}


	like(e: any) {

		e.stopPropagation();
		if (this.authService.isLoggedIn()) {
			if (this.userHasLiked(this.take)) {
				this.take.likedByUser = false;
				this.take.count -= 1;
				if (this.takeService.currentTake) this.takeService.currentTake.count -= 1;
				if (this.takeService.currentTake) this.takeService.currentTake.likedByUser = false;
				this.takeLikesService.deleteTakeLike(this.take, this.authService.currentUser._id);

			} else {
				this.take.likedByUser = true;
				this.take.count += 1;
				if (this.takeService.currentTake) this.takeService.currentTake.count += 1;
				if (this.takeService.currentTake) this.takeService.currentTake.likedByUser = true;
				this.takeLikesService.postTakeLike(this.take, this.authService.currentUser._id);
			}
		}
		else {

			//Mandar a signup

			this.authService.toggleAccess = true;
			this.authService.register = true;
			this.authService.toggleLogin = false;



		}
	}

	userHasLiked(thread: any) {

		if (this.authService.currentUser) {
			return this.takeLikesService.userHasLiked(thread, this.authService.currentUser._id);
		} else {
			return false;
		}
	}

	sendComment() {

		if (this.comment.length == 0) return


		if (this.authService.isLoggedIn()) {
			this.sendingComment = true;
			let data = {
				opinion: this.comment,
				takeUser: this.take.user._id,
				playerIds: this.take.user.playerIds

			}

			this.takeDiscussionService.postDiscussion(data, this.take._id)
				.subscribe((timeline: ITimeline) => {

					this.webSocketService.emitPost(this.take._id, "take", this.take.user._id, this.authService.currentUser._id)
					timeline.date = new Date(timeline.date)
					timeline.count = 0;
					timeline.created = "1min"
					this.timelines.unshift(timeline);
					this.sendingComment = false;
					this.comment = "";
					this.take.replies += 1;

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

	created(take: any): string {

		let milliseconds = take.date.getTime();
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

	getMoreNewestDiscussions(skip: number) {

		this.loadingDiscussions = true;
		this.takeDiscussionService.getNewestDiscussions(this.take._id, skip)
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
		this.takeDiscussionService.getTopDiscussions(this.take._id, skip)
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
				this.showInfiniteSpinner = false;


			},
				(err) => {

					this.loadingDiscussions = false;
					this.authService.errorMessage = err;

					setTimeout(() => {
						this.authService.errorMessage = null;
					}, 5000);
					this.showInfiniteSpinner = false;


				})
	}

	getMoreDiscussions(skip: number) {

		this.loadingDiscussions = true;
		this.takeDiscussionService.getDiscussions(this.take._id, skip)
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
				this.showInfiniteSpinner = false;


			},
				(err) => {

					this.loadingDiscussions = false;

					this.authService.errorMessage = err;
					setTimeout(() => {
						this.authService.errorMessage = null;
					}, 5000);
					this.showInfiniteSpinner = false;


				})
	}


	setVideoContainerStyle() {


		this.videoStyle = {
			'border-radius': '10px',
			'position': 'relative',
			'padding-top': ((this.take.videoHeight / this.take.videoWidth) * 100) + "%"

		}
	}

	setPictureContainerStyle() {


		this.pictureStyle = {
			'position': 'relative',
			'background': '#ededed',
			'border': '1px solid #ededed',
			'border-radius': '10px',
			'padding-top': ((this.take.pictureHeight / this.take.pictureWidth) * 100) + "%"

		}
	}


	doInfinite() {

		if (this.showInfiniteSpinner) return;

		this.showInfiniteSpinner = true;


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
