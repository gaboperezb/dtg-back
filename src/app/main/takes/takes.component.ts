import { Component, OnInit, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { TakeService } from '../../core/take.service';
import { ThreadsService } from '../../core/thread.service';
import { ITake } from '../../shared/interfaces';
import { LikesService } from '../../core/likers.service';
import { isPlatformBrowser } from '@angular/common';



@Component({
	selector: 'app-takes',
	templateUrl: './takes.component.html',
	styleUrls: ['./takes.component.scss'],
})
export class TakesComponent implements OnInit {

	sortBy: string;
	iconToDisplay: string = "hot-white"; //CHECK_DTG


	constructor(private authService: AuthService,
		public takeService: TakeService,
		private likesService: LikesService,
		@Inject(PLATFORM_ID) private platformId: Object,
		public threadsService: ThreadsService) { }

	ngOnInit() {

		if (isPlatformBrowser(this.platformId)) {
			this.navBarGetTakes()
		}
	}


	navBarGetTakes() {


		this.threadsService.toggleRefresh = false;
		this.takeService.toggleRefresh = false;

		if (this.takeService.followers) {

			this.getFollowersTakes(this.threadsService.filterBy)

		}
		else if (this.takeService.bookmarks) {
			this.getSavedTakes()
		}
		else if (this.takeService.hot) {


			this.getTakes(this.threadsService.filterBy)

		} else if (this.takeService.new) {


			this.getNewestTakes(this.threadsService.filterBy)

		} else if (this.takeService.top) {

			this.getTopTakes(this.threadsService.filterBy)


		}

	}

	getSavedTakes() {

		this.takeService.skipSaved = 0;
		this.takeService.loaderActive = true;
		this.takeService.placeholders = true;

		this.takeService.getBookmarks(this.takeService.skipSaved)
			.subscribe((takes: any) => {

			

				let prov = takes.map((take: any) => {
					take.date = new Date(take.date);
					take.created = this.created(take);
					take.likedByUser = this.userHasLiked(take);
					take.count = take.likers ? take.likers.length : 0;
					take.levelN = take.user.badge.picture.replace('.png', 'N.png');

					return take;
				})

				this.takeService.takes = prov
				this.takeService.loaderActive = false;
				setTimeout(() => {
					this.takeService.placeholders = false;
				}, 1000);

				this.threadsService.hideInfinite = false;
				this.takeService.toggleRefresh = false;
				this.threadsService.toggleRefresh = false;

				let height = (this.takeService.takes.length * 550) + 80;
				this.authService.stickyHeight = {
					"height": height + 'px'
				}

			},
				(err) => {




					this.takeService.loaderActive = false;
					this.takeService.placeholders = false;

					this.authService.errorMessage = err;
					setTimeout(() => {
						this.authService.errorMessage = null;
					}, 5000);

				})

	}

	getTakes(league: string) {
		this.threadsService.filterBy = league;
		this.takeService.skip = 0;


		this.takeService.loaderActive = true;
		this.takeService.placeholders = true;

		this.takeService.getTakes(league, this.takeService.skip)
			.subscribe((takes: any) => {


				let prov = takes.map((take: any) => {
					take.date = new Date(take.date);
					take.created = this.created(take);
					take.likedByUser = this.userHasLiked(take);
					take.count = take.likers ? take.likers.length : 0;
					take.levelN = take.user.badge.picture.replace('.png', 'N.png');

					return take;
				})



				this.takeService.takes = prov

				this.takeService.loaderActive = false;
				setTimeout(() => {
					this.takeService.placeholders = false;
				}, 1000);

				this.threadsService.hideInfinite = false;
				this.takeService.toggleRefresh = false;
				this.threadsService.toggleRefresh = false;

				let height = (this.takeService.takes.length * 550) + 80;
				this.authService.stickyHeight = {
					"height": height + 'px'
				}





			},
				(err) => {




					this.takeService.loaderActive = false;
					this.takeService.placeholders = false;

					this.authService.errorMessage = err;
					setTimeout(() => {
						this.authService.errorMessage = null;
					}, 5000);

				})

	}

	getNewestTakes(league: string) {


		this.takeService.skipNewest = 0;
		this.threadsService.filterBy = league;


		this.takeService.placeholders = true;
		this.takeService.loaderActive = true;


		this.takeService.getNewestTakes(league, this.takeService.skipNewest)
			.subscribe((takes: any) => {



				let prov = takes.map((take: any) => {
					take.date = new Date(take.date);
					take.created = this.created(take);
					take.likedByUser = this.userHasLiked(take);
					take.count = take.likers ? take.likers.length : 0;
					take.levelN = take.user.badge.picture.replace('.png', 'N.png');

					return take;
				})
				this.takeService.takes = prov
				this.takeService.loaderActive = false;
				setTimeout(() => {
					this.takeService.placeholders = false;
				}, 1000);


				this.threadsService.hideInfinite = false;
				this.takeService.toggleRefresh = false;
				this.threadsService.toggleRefresh = false;

				let height = (this.takeService.takes.length * 550) + 80;
				this.authService.stickyHeight = {
					"height": height + 'px'
				}





			},
				(err) => {


					this.takeService.loaderActive = false;

					this.takeService.placeholders = false;

					this.authService.errorMessage = err;
					setTimeout(() => {
						this.authService.errorMessage = null;
					}, 5000);

				})

	}

	getTopTakes(league: string) {



		this.takeService.skipTop = 0;
		this.threadsService.filterBy = league;



		this.takeService.placeholders = true;
		this.takeService.loaderActive = true;

		this.takeService.getTakes(league, this.threadsService.skipTop)
			.subscribe((takes: any) => {


				let prov = takes.map((take: any) => {
					take.date = new Date(take.date);
					take.created = this.created(take);
					take.likedByUser = this.userHasLiked(take);
					take.count = take.likers ? take.likers.length : 0;
					take.levelN = take.user.badge.picture.replace('.png', 'N.png');

					return take;
				})

				this.takeService.takes = prov
				this.takeService.loaderActive = false;
				setTimeout(() => {
					this.threadsService.placeholders = false;
				}, 1000);



				this.threadsService.hideInfinite = false;
				this.takeService.toggleRefresh = false;
				this.threadsService.toggleRefresh = false;

				let height = (this.takeService.takes.length * 550) + 80;
				this.authService.stickyHeight = {
					"height": height + 'px'
				}



			},
				(err) => {

					this.takeService.loaderActive = false;
					this.takeService.placeholders = false;



					this.authService.errorMessage = err;
					setTimeout(() => {
						this.authService.errorMessage = null;
					}, 5000);

				})

	}



	getFollowersTakes(league: string) {

		this.threadsService.filterBy = league;
		this.takeService.skipFollowers = 0;


		this.takeService.placeholders = true;
		this.takeService.loaderActive = true;



		this.takeService.getFollowingTakes(league, this.takeService.skipFollowers)
			.subscribe((takes: any) => {


				let prov = takes.map((take: any) => {
					take.date = new Date(take.date);
					take.created = this.created(take);
					take.likedByUser = this.userHasLiked(take);
					take.count = take.likers ? take.likers.length : 0;
					take.levelN = take.user.badge.picture.replace('.png', 'N.png');
					return take;
				})

				this.takeService.takes = prov

				this.takeService.loaderActive = false;

				setTimeout(() => {
					this.takeService.placeholders = false;
				}, 1000);



				this.threadsService.hideInfinite = false;

				let height = (this.takeService.takes.length * 550) + 80;
				this.authService.stickyHeight = {
					"height": height + 'px'
				}




			},
				(err) => {




					this.takeService.loaderActive = false;
					this.takeService.placeholders = false;

					this.authService.errorMessage = err;
					setTimeout(() => {
						this.authService.errorMessage = null;
					}, 5000);

				})

	}


	getMoreSavedTakes() {

		this.takeService.getBookmarks(this.takeService.skipSaved)
			.subscribe((takes: any) => {

				if (takes.length > 0) {
					let provisionalArray = takes.map((take: any) => {
						take.date = new Date(take.date);
						take.created = this.created(take);
						take.likedByUser = this.userHasLiked(take);
						take.count = take.likers ? take.likers.length : 0;
						take.levelN = take.user.badge.picture.replace('.png', 'N.png');
						return take;
					})

					let newThreadsArray = this.takeService.takes.concat(provisionalArray)
					//Eliminar duplicados. Esto sucede porque continuamente se agregan discusiones a la base de datos; el skip genera esto.
					let unique = newThreadsArray.filter((item, i, array) => {
						return array.findIndex((item2) => { return item2._id == item._id }) === i;
					})
					this.takeService.takes = unique;
					

				}
				this.threadsService.showInfiniteSpinner = false;

				let height = (this.takeService.takes.length * 550) + 80;
				this.authService.stickyHeight = {
					"height": height + 'px'
				}


			},
				(err) => {

					this.authService.errorMessage = err;
					this.threadsService.showInfiniteSpinner = false;
					setTimeout(() => {
						this.authService.errorMessage = null;
					}, 5000);

				})

	}

	getMoreTakes() {

		this.takeService.getTakes(this.threadsService.filterBy, this.takeService.skip)
			.subscribe((takes: any) => {

				if (takes.length > 0) {
					let provisionalArray = takes.map((take: any) => {
						take.date = new Date(take.date);
						take.created = this.created(take);
						take.likedByUser = this.userHasLiked(take);
						take.count = take.likers ? take.likers.length : 0;
						take.levelN = take.user.badge.picture.replace('.png', 'N.png');
						return take;
					})

					let newThreadsArray = this.takeService.takes.concat(provisionalArray)
					//Eliminar duplicados. Esto sucede porque continuamente se agregan discusiones a la base de datos; el skip genera esto.
					let unique = newThreadsArray.filter((item, i, array) => {
						return array.findIndex((item2) => { return item2._id == item._id }) === i;
					})
					this.takeService.takes = unique;
					

				}
				this.threadsService.showInfiniteSpinner = false;

				let height = (this.takeService.takes.length * 550) + 80;
				this.authService.stickyHeight = {
					"height": height + 'px'
				}


			},
				(err) => {

					this.authService.errorMessage = err;
					this.threadsService.showInfiniteSpinner = false;
					setTimeout(() => {
						this.authService.errorMessage = null;
					}, 5000);

				})

	}

	getMoreNewestTakes() {

		this.takeService.getNewestTakes(this.threadsService.filterBy, this.takeService.skipNewest)
			.subscribe((takes: any) => {


				if (takes.length > 0) {
					let provisionalArray = takes.map((take: any) => {
						take.date = new Date(take.date);
						take.created = this.created(take);
						take.likedByUser = this.userHasLiked(take);
						take.count = take.likers ? take.likers.length : 0;
						take.levelN = take.user.badge.picture.replace('.png', 'N.png');


						return take;
					})

					let newThreadsArray = this.takeService.takes.concat(provisionalArray)
					//Eliminar duplicados. Esto sucede porque continuamente se agregan discusiones a la base de datos; el skip genera esto.
					let unique = newThreadsArray.filter((item, i, array) => {
						return array.findIndex((item2) => { return item2._id == item._id }) === i;
					})
					this.takeService.takes = unique;
					

				}
				this.threadsService.showInfiniteSpinner = false;

				let height = (this.takeService.takes.length * 550) + 80;
				this.authService.stickyHeight = {
					"height": height + 'px'
				}


			},
				(err) => {

					this.authService.errorMessage = err;
					this.threadsService.showInfiniteSpinner = false;
					setTimeout(() => {
						this.authService.errorMessage = null;
					}, 5000);

				})

	}


	getMoreTopTakes() {

		this.takeService.getTopTakes(this.threadsService.filterBy, this.takeService.skipTop)
			.subscribe((takes: any) => {



				if (takes.length > 0) {
					let provisionalArray = takes.map((take: any) => {
						take.date = new Date(take.date);
						take.created = this.created(take);
						take.likedByUser = this.userHasLiked(take);
						take.count = take.likers ? take.likers.length : 0;
						take.levelN = take.user.badge.picture.replace('.png', 'N.png');


						return take;
					})

					let newThreadsArray = this.takeService.takes.concat(provisionalArray)
					//Eliminar duplicados. Esto sucede porque continuamente se agregan discusiones a la base de datos; el skip genera esto.
					let unique = newThreadsArray.filter((item, i, array) => {
						return array.findIndex((item2) => { return item2._id == item._id }) === i;
					})
					this.takeService.takes = unique;
					


				}
				this.threadsService.showInfiniteSpinner = false;

				let height = (this.takeService.takes.length * 550) + 80;
				this.authService.stickyHeight = {
					"height": height + 'px'
				}





			},
				(err) => {


					this.threadsService.showInfiniteSpinner = false;
					this.authService.errorMessage = err;
					setTimeout(() => {
						this.authService.errorMessage = null;
					}, 5000);

				})
	}

	getMoreFollowersTakes() {

		this.takeService.getFollowingTakes(this.threadsService.filterBy, this.takeService.skipFollowers)
			.subscribe((takes: any) => {

				if (takes.length > 0) {
					let provisionalArray = takes.map((take: any) => {
						take.date = new Date(take.date);
						take.created = this.created(take);
						take.likedByUser = this.userHasLiked(take);
						take.count = take.likers ? take.likers.length : 0;
						take.levelN = take.user.badge.picture.replace('.png', 'N.png');

						return take;
					})

					let newThreadsArray = this.takeService.takes.concat(provisionalArray)
					//Eliminar duplicados. Esto sucede porque continuamente se agregan discusiones a la base de datos; el skip genera esto.
					let unique = newThreadsArray.filter((item, i, array) => {
						return array.findIndex((item2) => { return item2._id == item._id }) === i;
					})
					this.takeService.takes = unique;
				




				}
				this.threadsService.showInfiniteSpinner = false;

				let height = (this.takeService.takes.length * 550) + 80;
				this.authService.stickyHeight = {
					"height": height + 'px'
				}


			},
				(err) => {

					this.threadsService.showInfiniteSpinner = false;
					this.authService.errorMessage = err;
					setTimeout(() => {
						this.authService.errorMessage = null;
					}, 5000);

				})

	}

	deleteTake(takeId: string) {
		this.takeService.takes = this.takeService.takes.filter(_take => _take._id !== takeId);
	}

	created(thread: ITake): string {

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

	userHasLiked(thread: ITake) {

		if (this.authService.currentUser) {
			return this.likesService.userHasLiked(thread, this.authService.currentUser._id);
		} else {
			return false;
		}
	}

}
