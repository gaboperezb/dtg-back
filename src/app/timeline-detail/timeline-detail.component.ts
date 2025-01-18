import { Component, OnInit, HostListener, ViewChild, ElementRef, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { IThread, ITake, ITimeline, IAnswer, ITrivia } from '../shared/interfaces';
import { ThreadLikesService } from '../core/thread-likers.service';
import { Location } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';

@Component({
	selector: 'app-timeline-detail',
	templateUrl: './timeline-detail.component.html',
	styleUrls: ['./timeline-detail.component.scss']
})
export class TimelineDetailComponent implements OnInit {


	thread: IThread;
	take: ITake;
	trivia: ITrivia;
	timeline: ITimeline;
	answers: IAnswer[] = [];
	sticky: boolean = false;
	offsetTopBack: any;
	@ViewChild('back') backElement: ElementRef;


	constructor(private route: ActivatedRoute,
		private authService: AuthService,
		private location: Location,
		private el: ElementRef,
		@Inject(PLATFORM_ID) private platformId: Object,
		private router: Router,
		private likesService: ThreadLikesService) { }

	ngOnInit(): void {

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
					this.configureComment(data.data.comment);
				}
			});
	}

	deleteComment(comment: string) {

		this.thread = null;
		this.take = null;
		this.trivia = null;
		this.timeline = null;
		this.router.navigateByUrl('/home');
		
	}

	

	scrollToItem(item) {

		if (isPlatformBrowser(this.platformId)) {
			let yOffset = document.getElementById(item).getBoundingClientRect().top - 110;
			window.scrollTo(0, yOffset);
			setTimeout(() => {
				this.authService.scrollTo = undefined
			}, 3000);
		}

	}

	checkSticky() {

		if (isPlatformBrowser(this.platformId)) {
			if (window.pageYOffset > this.offsetTopBack) {
				if (!this.sticky) this.sticky = true
			} else {
				if (this.sticky) this.sticky = false
			}
		}

	}

	goBack() {
		this.location.back();
	}


	// When the user scrolls the page, execute myFunction

	@HostListener("window:scroll", [])
	onWindowScroll() {
		this.checkSticky()
	}



	goToDiscussion() {
		this.router.navigate(['/discussions', this.take._id]);
	}


	goToPost() {
		this.router.navigate(['/posts', this.thread._id]);
	}

	filterAnswers(answerId) {
        this.answers = this.answers.filter(_answer => _answer._id !== answerId);
		this.timeline.numberOfAnswers -= 1;
		this.router.navigateByUrl('/home');
	}
	
	addAnswer(e: any) {

	}

	emitterImages() {
		setTimeout(() => {
			this.showVisible(null);
		}, 0);
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


	configureComment(comment: any) {

		//Discussion Configuration
		comment.date = new Date(comment.date);
		comment.created = this.created(comment);
		comment.count = comment.likers.length;
		comment.likedByUser = this.userHasLiked(comment);
		let notification;

		if (comment.thread) {
			comment.thread.date = new Date(comment.thread.date);
			comment.thread.likedByUser = this.userHasLiked(comment.thread);
			comment.thread.count = comment.thread.likers ? comment.thread.likers.length : 0
			let reducedText = comment.thread.title.substring(0, 40);
			if (reducedText.length < comment.thread.title.length) {
				comment.thread.titleToShow = comment.thread.title.substring(0, 40) + "...";
			} else {
				comment.thread.titleToShow = comment.thread.title;
			}

			this.thread = comment.thread;
	
		} else if (comment.take) {
			comment.take.date = new Date(comment.take.date);
			comment.take.likedByUser = this.userHasLiked(comment.take);
			comment.take.count = comment.take.likers ? comment.take.likers.length : 0
			let reducedText = comment.take.take.substring(0, 40);
			if (reducedText.length < comment.take.take.length) {
				comment.take.titleToShow = comment.take.take.substring(0, 40) + "...";
			} else {
				comment.take.titleToShow = comment.take.take;
			}

			this.take = comment.take;

		} else {

		

			this.trivia = comment.trivia;
	

		}

		comment.numberOfAnswers = comment.answers.length;
		this.timeline = comment;
		this.configureAnswers(this.timeline.answers)


	}


	configureAnswers(answers: IAnswer[]) {
		answers.forEach((answer) => {
			answer.date = new Date(answer.date);
			answer.created = this.created(answer);
			answer.count = answer.likers.length;
			answer.likedByUser = this.userHasLiked(answer);

		})
		this.answers = answers;

		if(isPlatformBrowser(this.platformId)) {
			setTimeout(() => {
				if (this.authService.scrollTo) this.scrollToItem(this.authService.scrollTo)
			}, 500);
		}
		
	}

	userHasLiked(timeline: any) {
		if (this.authService.isLoggedIn()) {
			return this.likesService.userHasLiked(timeline, this.authService.currentUser._id);
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

}
