import { Component, OnInit, ViewChild, HostListener, PLATFORM_ID, Inject, ElementRef } from '@angular/core';
import { PlayService } from '../core/play.service';
import { ITrivia, ITimeline } from '../shared/interfaces';
import { AuthService } from '../core/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PlayDiscussionService } from '../core/play-discussion.service';
import { PlayLikesService } from '../core/play-likers.service';
import { Location, isPlatformBrowser } from '@angular/common';
import { SwiperDirective } from 'ngx-swiper-wrapper';


@Component({
	selector: 'app-play-trivia-detail',
	templateUrl: './play-trivia-detail.component.html',
	styleUrls: ['./play-trivia-detail.component.scss']
})
export class PlayTriviaDetailComponent implements OnInit {

	data: any;
	id: string;
	trivia: ITrivia;
	sendingComment: boolean = false;
	textareaFocused: boolean = false;
	sortBy: string = "HOT";
	@ViewChild('back') backElement: ElementRef;
	isEnd: boolean = false;
	offsetTopBack
	addCommentToggled: boolean = false;
	showInfiniteSpinner: boolean = false;
	loadingDiscussions: boolean = true;
	loadingInitial: boolean = true;
	reactivateInfinite: any;
	timelines: ITimeline[] = [];

	swipeTimeOut: any;
	toggleSort: boolean = false;
	sticky: boolean = false;
	comment: string = ""
	@ViewChild(SwiperDirective) slides?: SwiperDirective;

	hot: boolean = true;
	new: boolean = false;
	top: boolean = false;


	slideOpts: any = {
		initialSlide: 0,
		speed: 400,
		allowTouchMove: false
	};

	countdown: number = 15;
	selected: boolean = false;
	userSelection: string = "";
	countInterval: any;
	ownerOftrivia: boolean = false;
	triviaAnswered: any;
	enableInfinite: boolean = false;
	skipHot: number = 0;
	skipNew: number = 0;
	skipTop: number = 0;
	swiper: any;
	alreadyAnswered: boolean = false;
	answer: any;
	helper: boolean = false;

	constructor(
		private router: Router,
		private location: Location,
		private playDiscussionService: PlayDiscussionService,
		private playLikesService: PlayLikesService,
		private playService: PlayService,
		@Inject(PLATFORM_ID) private platformId: Object,
		private route: ActivatedRoute,
		public authService: AuthService) {

		let id = this.route.snapshot.paramMap.get('id');
		this.trivia = this.playService.getDailyTrivia(id);
	

	}

	ngOnInit() {


		if (!this.trivia) {
			this.router.navigateByUrl('/home')
			return // cordova kill
		}

		if (this.trivia.revealAnswer) { //24 horas después
			this.answer = this.trivia.options.find(o => o._id == this.trivia.correctOption);
		}

		this.getDiscussions();
		if (this.authService.currentUser.dailyTrivias && this.authService.currentUser.dailyTrivias.length) {
			this.triviaAnswered = this.authService.currentUser.dailyTrivias.find(t => t.trivia == this.trivia._id);
			if (!!this.triviaAnswered && this.triviaAnswered.answer) {
				this.userSelection = this.triviaAnswered.answer
				this.trivia.correct = this.userSelection == this.trivia.correctOption ? true : false;
			} else if (!!this.triviaAnswered && this.triviaAnswered.timesUp) {
				this.userSelection = null;
				this.trivia.correct = false;
				this.trivia.timesUp = true;
			}
		}

		if (!!this.triviaAnswered) { // ya se seleccionó
			this.calculatePercentage()
			this.checkIfTriviaHelper()
			this.selected = true;
			this.addCommentToggled = true;
			this.alreadyAnswered = true;

		} else {

			this.countInterval = setInterval(() => {

				this.countdown = --this.countdown;
				if (this.countdown <= 0) {
					this.timeOut();
					clearInterval(this.countInterval);
				}
			}, 1000);
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

	checkSticky() {
		if (window.pageYOffset > this.offsetTopBack) {
			if (!this.sticky) this.sticky = true
		} else {
			if (this.sticky) this.sticky = false
		}
	}

	@HostListener("window:scroll", [])
	onWindowScroll() {
		this.checkSticky()

	}



	checkIfTriviaHelper() {
		let item = localStorage.getItem('trivia-notifications-helper')
		if (!item) {
			this.helper = true;
		}
	}

	setTriviaHelper() {
		localStorage.setItem('trivia-notifications-helper', '1')
		this.helper = false;
	}


	ngAfterViewInit() {

		if (isPlatformBrowser(this.platformId)) this.offsetTopBack = this.backElement.nativeElement.offsetTop - 55;

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



	getDiscussions() {

		this.enableInfinite = false;
		this.skipHot = 0;


		this.playDiscussionService.getTriviaDiscussions(this.trivia._id, 0)
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

		this.playDiscussionService.getNewestTriviaDiscussions(this.trivia._id, 0)
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
					this.enableInfinite = true;
					this.loadingDiscussions = false;
					this.loadingInitial = false;

					this.authService.errorMessage = err;
					setTimeout(() => {
						this.authService.errorMessage = null;
					}, 5000);

				})

	}

	getTopDiscussions() {

		this.enableInfinite = false;
		this.skipTop = 0;

		this.playDiscussionService.getTopTriviaDiscussions(this.trivia._id, 0)
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

	getMoreNewestDiscussions(skip: number) {

		this.loadingDiscussions = true;
		this.playDiscussionService.getNewestTriviaDiscussions(this.trivia._id, skip)
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



				this.timelines = unique;


			},
				(err) => {
					this.enableInfinite = true;
					this.loadingDiscussions = false;
					this.loadingInitial = false;
					this.showInfiniteSpinner = false;
					this.authService.errorMessage = err;
					setTimeout(() => {
						this.authService.errorMessage = null;
					}, 5000);

				})
	}


	getMoreTopDiscussions(skip: number) {

		this.loadingDiscussions = true;
		this.playDiscussionService.getTopTriviaDiscussions(this.trivia._id, skip)
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
				this.showInfiniteSpinner = false;
				if (timelines.length < 25) this.enableInfinite = false;


			},
				(err) => {
					this.enableInfinite = true;
					this.loadingDiscussions = false;
					this.loadingInitial = false;
					this.showInfiniteSpinner = false;
					this.authService.errorMessage = err;
					setTimeout(() => {
						this.authService.errorMessage = null;
					}, 5000);

				})
	}

	getMoreDiscussions(skip: number) {

		this.loadingDiscussions = true;
		this.playDiscussionService.getTriviaDiscussions(this.trivia._id, skip)
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
				this.showInfiniteSpinner = false;
				if (timelines.length < 25) this.enableInfinite = false;


			},
				(err) => {
					this.showInfiniteSpinner = false;
					this.enableInfinite = true;
					this.loadingDiscussions = false;
					this.loadingInitial = false;

					this.authService.errorMessage = err;
					setTimeout(() => {
						this.authService.errorMessage = null;
					}, 5000);

				})
	}


	calculatePercentage() {
		let percentageSum = 0;
		let totalVotes = this.trivia.options.reduce((accumulator, current) => accumulator + current.count, 0);
		for (let i = 0; i < this.trivia.options.length; i++) {
			const option = this.trivia.options[i];
			option.fullPercentage = isNaN((+option.count / +totalVotes) * 100) ? 0 : (+option.count / +totalVotes) * 100
			option.flooredPercentage = Math.floor(option.fullPercentage)
			option.decimal = option.fullPercentage % 1;
			percentageSum += option.flooredPercentage
		}
		let sortedPercetages = this.trivia.options.concat().sort((a, b) => b.decimal - a.decimal)

		let diffTo100 = 100 - percentageSum;
		for (let i = 0; i < diffTo100; i++) {
			let index = this.trivia.options.findIndex(o => o._id == sortedPercetages[0]._id)
			if (index > -1) this.trivia.options[index].flooredPercentage += 1

		}

	}

	timeOut() {

		this.calculatePercentage();
		this.selected = true;
		this.trivia.timesUp = true;
		this.trivia.pending = false;
		let dailyTrivia = {
			league: this.trivia.league,
			trivia: this.trivia._id,
			timesUp: true
		}
		if (!this.authService.currentUser.dailyTrivias.some(t => t.trivia == this.trivia._id)) {
			this.authService.currentUser.dailyTrivias.push(dailyTrivia)
			this.playService.timesUp(this.trivia._id)
		}

		setTimeout(() => {
			this.nextSlide()
		}, 1000);
	}



	deleteComment(comment: string) {

		this.timelines = this.timelines.filter(timeline => timeline._id.toString() != comment.toString());

	}

	nextSlide() {
		this.addCommentToggled = true;

		this.slides.nextSlide(400)
		this.checkIfTriviaHelper()
	}


	commentFocused() {
		this.textareaFocused = true;
	}

	commentUnfocused() {
		this.textareaFocused = false;
	}

	sendComment() {

		if (this.comment.length == 0) return


		if (this.authService.isLoggedIn()) {
			this.sendingComment = true;
			let data = {
				opinion: this.comment
			}

			this.playDiscussionService.postTriviaDiscussion(data, this.trivia._id)
				.subscribe((timeline: ITimeline) => {

					timeline.date = new Date(timeline.date)
					timeline.count = 0;
					timeline.created = "1min"
					this.timelines.unshift(timeline);
					this.sendingComment = false;
					this.comment = "";

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

	selection(option) {

		clearInterval(this.countInterval);
		if (!this.trivia.timesUp && !this.trivia.timesUp) {
			option.count += 1;
			this.calculatePercentage()
			this.userSelection = option._id;
			this.trivia.pending = false;
			this.trivia.correct = this.userSelection == this.trivia.correctOption ? true : false;
			let dailyTrivia = {
				league: this.trivia.league,
				trivia: this.trivia._id,
				answer: option._id,
				timesUp: false
			}
			if (!this.authService.currentUser.dailyTrivias.some(t => t.trivia == this.trivia._id)) {
				this.authService.currentUser.dailyTrivias.push(dailyTrivia)
				this.playService.postTriviaAnswer(this.trivia._id, option._id);
			}

			setTimeout(() => {
				this.nextSlide()
				this.selected = true;
			}, 1000);
		}
	}

	ngOnDestroy() {

		if (this.trivia.timesUp || this.userSelection) {

		} else {

			let dailyTrivia = {
				league: this.trivia.league,
				trivia: this.trivia._id,
				timesUp: true
			}
			if (!this.authService.currentUser.dailyTrivias.some(t => t.trivia == this.trivia._id)) {
				this.authService.currentUser.dailyTrivias.push(dailyTrivia)
				this.playService.timesUp(this.trivia._id)
			}
		}
	}

	goBack() {

		if (this.trivia.timesUp || this.userSelection) {

			this.authService.addurl = false;
			this.location.back();

		} else {

			var r = confirm("If you close the trivia you will not be able to play again");
			if (r == true) {
				this.trivia.pending = false;
				this.trivia.timesUp = true;
				let dailyTrivia = {
					league: this.trivia.league,
					trivia: this.trivia._id,
					timesUp: true
				}
				if (!this.authService.currentUser.dailyTrivias.some(t => t.trivia == this.trivia._id)) {
					this.authService.currentUser.dailyTrivias.push(dailyTrivia)
					this.playService.timesUp(this.trivia._id)
				}
				this.authService.addurl = false;
				this.location.back();

			} else {

			}
		}

	}

	userHasLiked(thread: any) {

		if (this.authService.currentUser) {
			return this.playLikesService.userHasLiked(thread, this.authService.currentUser._id);
		} else {
			return false;
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



	doInfinite() {


		if (this.showInfiniteSpinner || !this.addCommentToggled) return;
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
