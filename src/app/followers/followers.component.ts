import { Component, ElementRef, ViewChild, Renderer2, Inject } from '@angular/core';
import { IUserDB } from '../../app/shared/interfaces';
import { AuthService } from '../../app/core/auth.service';
import * as _ from 'lodash';
import { PLATFORM_ID } from '@angular/core';
 import { isPlatformBrowser, isPlatformServer } from '@angular/common';
 

/**
 * Generated class for the FollowersPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
	selector: 'app-followers',
	templateUrl: './followers.component.html',
	styleUrls: ['./followers.component.scss']
})
export class FollowersComponent {

	title: string = "";
	skipFollowing: number = 0;
	skipFollowers: number = 0;
	users: IUserDB[] = [];
	fetchUser: string;
	wait: boolean = true;
	enableInfinite: boolean = false;
	scrollTO: any;
	swipeTimeOut: any;
	showInfiniteSpinner: boolean = false;

	constructor(
		private renderer: Renderer2,
		@Inject(PLATFORM_ID) private platformId: Object,
		private authService: AuthService,
		private el: ElementRef) {

		let data = this.authService.paramSignUp
		this.title = data.title;
		this.fetchUser = data.userId;
	}

	
	ngOnInit() {
		if(isPlatformBrowser(this.platformId)) {

			if (this.title.toLocaleLowerCase() == "followers") {

		
				setTimeout(() => {
					this.getFollowers();
				}, 500);
			}
			else {
				setTimeout(() => {
					this.getFollowing();
				}, 500);
	
			}

			this.renderer.addClass(document.body, 'modal-open');
				
		}
	}

	ngOnDestroy() {
		this.renderer.removeClass(document.body, 'modal-open');
	}

	goBack() {
		this.authService.followInfo = false;
	}

	showVisible(e) {

		if (isPlatformBrowser(this.platformId)) {
			for (let img of this.el.nativeElement.querySelectorAll('.profile-pic')) {
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


	getFollowers() {

		this.authService.getFollowers(0, this.fetchUser)
			.subscribe((data: any) => {
				let followers = data.followers.filter(element => element._id != this.authService.currentUser._id);
				this.wait = false;

				this.users = followers;
				if (data.followers.length < 20) this.enableInfinite = false;
				else {
					this.enableInfinite = true;
				}


				setTimeout(() => {
					this.showVisible(null);
				}, 0);

			},
				(err) => {
					this.wait = false;
					this.authService.errorMessage = err;
					setTimeout(() => {
						this.authService.errorMessage = null;
					}, 5000);

					
					
				});

	}

	getMoreFollowers() {

		this.authService.getFollowers(this.skipFollowers, this.fetchUser)
			.subscribe((data: any) => {
				let followers = data.followers.filter(element => element._id != this.authService.currentUser._id);;
				this.wait = false;
				let newTimelinesArray = this.users.concat(followers);

				//Eliminar duplicados. Esto sucede porque continuamente se agregan discusiones a la base de datos; el skip genera esto.
				var unique = newTimelinesArray.filter((item, i, array) => {
					return array.findIndex((item2: any) => { return item2._id == item._id }) === i;
				})
				this.users = unique;

			
				if (data.followers.length < 20) this.enableInfinite = false;
				setTimeout(() => {
					this.showVisible(null);
				}, 0);

			},
				(err) => {
					this.wait = false;
					this.authService.errorMessage = err;
					setTimeout(() => {
						this.authService.errorMessage = null;
					}, 5000);
				});

	}


	getFollowing() {

		this.authService.getFollowing(0, this.fetchUser)
			.subscribe((data: any) => {

				this.users = data.following.filter(element => element._id != this.authService.currentUser._id);
				this.wait = false;
				if (data.following.length < 20) this.enableInfinite = false;
				else {
					this.enableInfinite = true;
				}
				setTimeout(() => {
					this.showVisible(null);
				}, 0);
				this.showInfiniteSpinner = false;

			},
				(err) => {
					this.wait = false;
					this.authService.errorMessage = err;
					setTimeout(() => {
						this.authService.errorMessage = null;
					}, 5000);
					this.showInfiniteSpinner = false;
					
				});
	}

	getMoreFollowing() {

		this.authService.getFollowing(this.skipFollowing, this.fetchUser)
			.subscribe((data: any) => {
				let following = data.following.filter(element => element._id != this.authService.currentUser._id);
				this.wait = false;
				let newTimelinesArray = this.users.concat(following);

				//Eliminar duplicados. Esto sucede porque continuamente se agregan discusiones a la base de datos; el skip genera esto.
				var unique = newTimelinesArray.filter((item, i, array) => {
					return array.findIndex((item2: any) => { return item2._id == item._id }) === i;
				})
				this.users = unique;
				if (data.following.length < 20) this.enableInfinite = false;
				setTimeout(() => {
					this.showVisible(null);
				}, 0);
				this.showInfiniteSpinner = false;

			},
				(err) => {
					this.wait = false;
					this.showInfiniteSpinner = false;
					this.authService.errorMessage = err;
					setTimeout(() => {
						this.authService.errorMessage = null;
					}, 5000);
					
				});

	}

	
	doInfinite() {

		this.showInfiniteSpinner = true;

		if (this.title.toLocaleLowerCase() == "following") {
			this.skipFollowing += 20;
		
			this.getMoreFollowing();
		} else {
			this.skipFollowers += 20;
	
			this.getMoreFollowers();

		}

	}


}
