import { Component, OnInit, ViewChild, Input, ElementRef, Output, EventEmitter, Inject, PLATFORM_ID } from '@angular/core';
import { AuthService } from '../../../core/auth.service';
import { ITake } from '../../../shared/interfaces';
import { TakeService } from '../../../core/take.service';
import { InViewportMetadata } from 'ng-in-viewport';
import { ThreadsService } from '../../../core/thread.service';
import { Router } from '@angular/router';;
import { LikesService } from '../../../core/likers.service';
import { TakeLikesService } from '../../../core/take-likers.service';
import { StateService } from 'src/app/core/state.service';
import * as _ from 'lodash';
import * as e from 'express';
import { isPlatformBrowser } from '@angular/common';


declare var loadImage;

@Component({
	selector: 'app-take',
	templateUrl: './take.component.html',
	styleUrls: ['./take.component.scss'],
})
export class TakeComponent {

	@ViewChild('videoTake') videoTake: ElementRef;
	@Input() take: ITake;
	@Input() i: number;
	@Output() deleteTakeEmitter = new EventEmitter();
	toggleEdit: boolean = false;
	toggleShare: boolean = false;

	linkStyle: any;
	iframeStyle: any;
	timeInterval: any;
	displayTimeTimeout: any;
	time: string;
	showTimer: boolean = false;
	videoPaused: boolean = true;
	dontPlay: boolean = false;
	largeLink: boolean = false;
	smallLink: boolean = false;
	reducedTitle: string = "";
	videoStyle: any;
	pictureStyle: any;

	hideVideo: boolean = false;
	notLoaded: boolean = true;
	videoLoaded: boolean = false;

	options: string[] = [];
	showResults: boolean = false;
	optionsWithPercentage: any[] = [];
	percentageSum: number = 0;
	totalVotes: number = 0;
	voted: boolean = false;
	pollEffect: boolean = false;


	constructor(public authService: AuthService,
		private el: ElementRef,
		private router: Router,
		@Inject(PLATFORM_ID) private platformId: Object,
		private stateService: StateService,
		private takeLikesService: TakeLikesService,
		private threadsService: ThreadsService,
		public takeService: TakeService) { }





	ngOnDestroy() {

		if (isPlatformBrowser(this.platformId)) {
			if (this.take.video) this.unloadVideo();
		}
	}

	ngOnInit() {


		if (this.take.video) {
			this.setVideoContainerStyle();

		}

		if (this.take.picture) {
			this.setPictureContainerStyle()
		}

		if (this.take.type == 'Link') {

			this.resizeURLImage();

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

		this.take.saved = this.userHasSaved(this.take)

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
        for (let i = 0; i < this.options.length; i++) {
            this.take.optionsWithPercentage.push(this.createOptionsObject(i));
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

                    }
                }

            }
        }

        this.take.voted = true;
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

	toggleMoreOptions(e: any) {
		e.stopPropagation()
		this.toggleEdit = !this.toggleEdit;
	}

	editTake(e: any) {

		this.toggleEdit = false;
		e.stopPropagation()

		this.takeService.takeToEdit = this.take;
		this.takeService.takeToEditOriginal = this.take;
		this.router.navigateByUrl('/create-discussion')
		//editar
	}

	userHasSaved(take: ITake) {

		if (this.authService.currentUser && take.bookmarks) {
			return take.bookmarks.some((user: any) => user === this.authService.currentUser._id);
		} else {
			return false;
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
				}, 3000);

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


	deleteTake(e: any) {

		this.toggleEdit = false;
		e.stopPropagation()
		var r = confirm("Do you want to delete this discussion?");
		if (r) {
			let data = {
				takeId: this.take._id,
				userId: this.authService.currentUser._id
			}

			this.deleteTakeEmitter.emit(this.take._id);
			this.takeService.deleteTake(data)
				.subscribe((success) => {

					if (success) {



					} else {

						this.authService.errorMessage = 'Could not delete discussion. Please try again later'
						setTimeout(() => {
							this.authService.errorMessage = null;
						}, 3000);



					}
				},
					(err) => {
						this.authService.errorMessage = 'Could not delete discussion. Please try again later'
						setTimeout(() => {
							this.authService.errorMessage = null;
						}, 3000);

					});

		} else {

		}
	}

	toggleSharing(e: any) {
		e.stopPropagation()
		this.toggleShare = !this.toggleShare;

	}

	sharePost(e: any, action: string) {

		e.stopPropagation();
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

		this.toggleShare = false;

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

	setPictureContainerStyle() {

		this.pictureStyle = {
			'position': 'relative',
			'background': '#ededed',
			'border': '1px solid #dcdcdc',
			'border-radius': '10px',
			'padding-top': ((this.take.pictureHeight / this.take.pictureWidth) * 100) + "%"

		}
	}


	resizeURLImage() {

		if (this.take.thumbnail_width > 500 && this.take.provider_name != 'Twitter' && this.take.urlType != 'video') {
			this.cutURLText(150)
			this.largeLink = true;

		} else {
			this.cutURLText(150)
			this.smallLink = true;
		}
	}



	onPause($event) {

		clearInterval(this.timeInterval);

		let vid = $event.target;

		this.videoPaused = true;

		clearInterval(this.displayTimeTimeout)



	}


	onPlay($event) {

		let vid = $event.target;
		this.videoPaused = false;






	}

	onMetadata($event) {

	}


	goAccess(type: string) {
		this.authService.toggleAccess = true;
		this.authService.register = true;

		if (type == 'login') this.authService.toggleLogin = true;
		else {
			this.authService.toggleLogin = false;
		}

	}


	unloadVideo() {

		if (isPlatformBrowser(this.platformId)) {
			this.videoTake.nativeElement.pause();
			this.videoTake.nativeElement.src = ""; // empty source
			this.videoTake.nativeElement.load();
			this.videoLoaded = false;
			this.videoPaused = true;
			this.videoTake.nativeElement.muted = true
		}

	}

	loadVideo() {


		if (isPlatformBrowser(this.platformId)) {
			this.videoTake.nativeElement.pause();
			this.videoTake.nativeElement.src = this.take.video; // empty source

			this.videoTake.nativeElement.load();
			this.videoTake.nativeElement.play();
			this.videoLoaded = true;
		}

	}



	openLink(e: any) {

		e.stopPropagation()
		window.open(this.take.url, "_blank");
	}

	onData(e: any) {
		this.notLoaded = false;

		let vid = e.target;
		if (this.take.videoCurrentTime) vid.currentTime = this.take.videoCurrentTime;
		this.take.videoCurrentTime = null;

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



	itemTapped() {

		if (this.take.video) {
			let vid: any = document.getElementById('media-' + this.take._id);
			this.take.videoCurrentTime = vid.currentTime;

		}

		this.takeService.currentTake = this.take;
		this.router.navigate(['/discussions', this.take._id]);

	}

	like(e: any) {

		e.stopPropagation();
		if (this.authService.isLoggedIn()) {
			if (this.userHasLiked(this.take)) {
				this.take.likedByUser = false;
				this.take.count -= 1;
				this.takeLikesService.deleteTakeLike(this.take, this.authService.currentUser._id);

			} else {
				this.take.likedByUser = true;
				this.take.count += 1;
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

	goToUser(event) {
		event.stopPropagation()
		this.router.navigate(['/u', this.take.user.username]);
	}

	/* goToUser(event) {
	
		let user = this.take.user;
	
		event.stopPropagation()
		if (this.authService.isLoggedIn()) {
			if (this.authService.currentUser.username == user.username) {
				this.authService.downloadProfile = true;
				let data = {
					fromTabs: false,
					loadInitial: true
				}
				this.authService.paramSignUp = data;
				this.navCtrl.navigateForward(this.router.url.substr(0, 10) + '/profile');
	
			} else {
				let data = {
					user: user
				}
				this.authService.paramSignUp = data;
				this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/user', user._id]);
	
			}
	
		} else {
			let data = {
				user: user
			}
			this.authService.paramSignUp = data;
			this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/user', user._id])
	
		}
	
	} */


	setVideoContainerStyle() {


		this.videoStyle = {
			'border-radius': '10px',
			'position': 'relative',
			'padding-top': ((this.take.videoHeight / this.take.videoWidth) * 100) + "%"

		}
	}


	setiframeStyle() {

		let percentage = (this.takeService.width / this.take.htmlWidth);

		this.iframeStyle = {
			'height': this.take.htmlHeight * percentage > this.take.htmlHeight ? this.take.htmlHeight + 'px' : this.take.htmlHeight * percentage + 'px',
			'width': this.takeService.width + 'px',
			'margin': '16px 0'

		}



	}

	public changeVideoAudio(id: string, e: any) {

		e.stopPropagation();
		let vid: any = document.getElementById('media-' + id);
		if (vid.muted) {
			e.preventDefault();
		}
		this.fullVideo(vid);

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


	fullVideo(vid: any) {



		vid.muted = false;
		this.videoPaused = false;
		this.notLoaded = false;



	}

	fullSizePicture(e: any) {
		e.stopPropagation();
		this.takeService.fullScreen = true;
		this.takeService.fullScreenImage = this.take.picture
		this.stateService.freezeBody()
	}





	dataon() {

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

	setLinkStyle() {

		this.linkStyle = {
			'background-image': 'url(' + this.take.thumbnail_url + ')',
			'background-size': 'cover',
			'height': '75px',
			'width': '95px',
			'margin-left': '10px',
			'background-position': 'center',
			'border-radius': '5px',
			'float': 'right',
			'position': 'relative',
			'overflow': 'hidden'
		}

	}


}
