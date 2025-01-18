import { Component, OnInit, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { AuthService } from '../core/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { IThread } from '../shared/interfaces';
import * as _ from 'lodash';
import { ThreadLikesService } from '../core/thread-likers.service';
import { LikesService } from '../core/likers.service';
import { ThreadsService } from '../core/thread.service';
import { SeoSocialShareService } from '../core/seo-social-share.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
	selector: 'app-featured',
	templateUrl: './featured.component.html',
	styleUrls: ['./featured.component.scss'],
})
export class FeaturedComponent implements OnInit {

	league: string = "";
	leagueToShow: string = ";"
	loaderInstance: any;
	hideInfinite: boolean = false;
	skip: number = 0;
	showTitle: boolean = false;
	loadingFeatured: boolean = true;
	featuredThreads: any[] = [];
	scrollPosition: number;
	swipeTimeOut: any;
	enableInfinite: boolean = false;
	showInfiniteSpinner: boolean = false;

	constructor(private authService: AuthService,
		private threadLikesService: ThreadLikesService,
		private likesService: LikesService,
		private seoSocialShareService: SeoSocialShareService,
		@Inject(PLATFORM_ID) private platformId: Object,
		private router: Router,
		public threadsService: ThreadsService,
		private route: ActivatedRoute) {


	}

	ngOnInit() {

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

					this.configureThreads(data.data.threads);
					this.configureSEO()
				
				}

			});

	}

	configureSEO() {

		
		let data = {
			title: "Featured Posts - Discuss the Game",
			description: "Discuss the Game is a community-powered platform for die-hard sports fans, where users talk sports, create content, share their sports opinions, and chat and connect with fans.",
			site: 'https://www.discussthegame.com/featured',
			large: false,
			website: true
		}
		this.seoSocialShareService.setData(data)
	}

	configureThreads(threads: IThread[]) {

		let prov = threads.map((thread: any) => {
			thread.date = new Date(thread.date);
			thread.created = this.created(thread);
			thread.likedByUser = this.userHasLiked(thread);
			thread.count = thread.likers ? thread.likers.length : 0;
			thread.levelN = thread.user.badge.picture.replace('.png', 'N.png');
			let reducedText = thread.title.substring(0, 50);
			if (reducedText.length < thread.title.length) {
				thread.titleToShow = thread.title.substring(0, 50) + "...";
			} else {
				thread.titleToShow = thread.title;
			}

			return thread;
		})

		this.featuredThreads = prov;
		this.enableInfinite = true;

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


	

	getMoreFeatured(league: string) {

	
		this.threadsService.getFeaturedForFeaturedPage(this.threadsService.filterBy, this.skip)
			.subscribe((threads: any) => {

				if (threads.length > 0) {

					let prov = threads.map((thread: any) => {
						thread.date = new Date(thread.date);
						thread.created = this.created(thread);
						thread.likedByUser = this.userHasLiked(thread);
						thread.count = thread.likers ? thread.likers.length : 0;
						thread.levelN = thread.user.badge.picture.replace('.png', 'N.png');
						let reducedText = thread.title.substring(0, 50);
						if (reducedText.length < thread.title.length) {
							thread.titleToShow = thread.title.substring(0, 50) + "...";
						} else {
							thread.titleToShow = thread.title;
						}

						return thread;
					})
					let newThreadsArray = this.featuredThreads.concat(prov)
					//Eliminar duplicados. Esto sucede porque continuamente se agregan discusiones a la base de datos; el skip genera esto.
					let unique = newThreadsArray.filter((item, i, array) => {
						return array.findIndex((item2) => { return item2._id == item._id }) === i;
					})
					this.featuredThreads = unique;

				} else {
					this.enableInfinite = false;
				}
				this.showInfiniteSpinner = false;


			},
				(err) => {
					this.showInfiniteSpinner = false;
					this.authService.errorMessage = err;
					setTimeout(() => {
						this.authService.errorMessage = null;
					}, 5000);

				})
	}

	deleteThread(threadId: string) {
        this.threadsService.featuredThreads = this.threadsService.featuredThreads.filter(_thread => _thread._id !== threadId);
    }

	doInfinite() {



		let path = this.router.url.split('?')
        if (this.showInfiniteSpinner || path[0] != '/featured') return;
		this.showInfiniteSpinner = true;
		this.skip += 6;
		this.getMoreFeatured(this.league);


	}



}
