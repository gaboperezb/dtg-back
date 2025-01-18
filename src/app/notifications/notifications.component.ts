import { Component } from '@angular/core';
import { AuthService } from '../../app/core/auth.service';
import { IThread } from '../../app/shared/interfaces';

import { ThreadLikesService } from '../../app/core/thread-likers.service';

import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';


@Component({
	selector: 'app-notifications',
	templateUrl: './notifications.component.html',
	styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent {

	notifications: any[] = [];
	begin: number = 0;
	end: number = 20;
	wait: boolean = true;
	permissionForNotifications: boolean;
	enableInfinite: boolean = true;
	loadingNotis: boolean = true;
	scrollSubscription: any;
	scrollTO: any;
	comment: string = "";
	toggleComment: boolean = false;


	constructor(
		public authService: AuthService,
		private router: Router,
		private titleService: Title,
		private likesService: ThreadLikesService) {

	}


	ngOnInit() {
		this.getNotis()
	}

	clearNotifications() {

		this.authService.currentUser.notifications = this.authService.currentUser.notifications.filter(n => n == 'message');
		this.titleService.setTitle('Discuss the Game: Community-powered platform for sports fans');
		this.authService.notifications = 0; //Para que se quita el circulo hasta que se bajen las notificaciones (front end)
		this.authService.clearNotifications(0, "noti")
			.subscribe((success) => {


			},
				(err) => {



				});

	}



	userHasLiked(thread: IThread) {

		if (this.authService.currentUser) {
			return this.likesService.userHasLiked(thread, this.authService.currentUser._id);
		} else {
			return false;
		}
	}

	goToUser(event, user) {

		event.stopPropagation();
		this.router.navigate(['/u', user.username]);
	}

	getNotis(event?: any) {

	
		
		this.enableInfinite = false;

		this.authService.getNotis()
			.subscribe((notis: any) => {

				notis = notis.filter(noti => noti.thread || noti.take || noti.trivia || noti.typeOf == 'follow');
				let notisMapped = notis.map((noti: any) => {

			

					if (noti.typeOf != 'follow') {

						noti.timeline.date = new Date(noti.timeline.date);
						noti.timeline.created = this.created(noti.timeline);
						noti.notification.date = new Date(noti.notification.date);
						noti.notification.created = this.created(noti.notification);
						noti.timeline.likedByUser = this.userHasLiked(noti.timeline);

						if (noti.thread) {

							if (noti.threadTitle) {
								let reducedText = noti.threadTitle.substring(0, 40);
								if (reducedText.length < noti.threadTitle.length) {
									noti.titleToShow = noti.threadTitle.substring(0, 40) + "...";
								} else {
									noti.titleToShow = noti.threadTitle;
								}
							}


						}

						if (noti.take) {

							if (noti.takeTitle) {
								let reducedText = noti.takeTitle.substring(0, 40);
								if (reducedText.length < noti.takeTitle.length) {
									noti.titleToShow = noti.takeTitle.substring(0, 40) + "...";
								} else {
									noti.titleToShow = noti.takeTitle;
								}
							}

						}

						if (noti.replyText) {
							let reducedTextMention = noti.replyText.substring(0, 40);
							if (reducedTextMention.length < noti.replyText.length) {
								noti.replyTextToShow = noti.replyText.substring(0, 40) + "...";
							} else {
								noti.replyTextToShow = noti.replyText;
							}
						}

					} else {
						noti.date = new Date(noti.date);
						noti.created = this.created(noti);

					}

					return noti;
				})

				this.notifications = notisMapped;
				this.authService.visibleNotifications = this.notifications


				if (this.authService.notifications > 0) this.clearNotifications();
				this.wait = false;
				this.loadingNotis = false;
				this.enableInfinite = true;
				

			},
				(err) => {

					this.enableInfinite = true;
					this.loadingNotis = false;
					this.wait = false;

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





}
