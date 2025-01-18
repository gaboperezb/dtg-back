
import { IUserDB } from '../../shared/interfaces';
import { AuthService } from '../../core/auth.service';
import { WebSocketService } from '../../core/websocket.service';
import { Router } from '@angular/router';
import { Component, Input } from '@angular/core';


@Component({
	selector: 'app-followers-item',
	templateUrl: './followers-item.component.html',
	styleUrls: ['./followers-item.component.scss']
})
export class FollowersItemComponent {

	@Input() user: IUserDB;
	follow: boolean = false;

	constructor(private authService: AuthService,
		private webSocketService: WebSocketService,
		private router: Router) {

	}

	ngOnInit() {


		if(this.authService.isLoggedIn()) this.followRelation();
	

	}

	followRelation() {



		if (this.authService.currentUser.following.indexOf(this.user._id) >= 0) {
			this.user.provFollowing = true;
			this.user.loadingFollow = false;
		} else {
			this.user.loadingFollow = false;
		}
	}


	goToUser(e: any) {

		e.stopPropagation()
		this.authService.followInfo = false;
		this.router.navigate(['/u', this.user.username]);

	}


	followUser(e: any) {

		e.stopPropagation();
		if(this.authService.isLoggedIn()) {
			if (!this.user.loadingFollow) {
				if (this.user.provFollowing) {
					//Unfollow
					this.user.provFollowing = false;
					this.authService.currentUser.followingNumber -= 1;
					this.user.followersNumber -= 1;
	
					this.authService.currentUser.following = this.authService.currentUser.following.filter(element => element != this.user._id);
					this.authService.unfollow(this.user._id)
						.subscribe(() => {
	
						},
							(err) => {
								this.authService.errorMessage = err;
								setTimeout(() => {
									this.authService.errorMessage = null;
								}, 5000);
							});
	
				} else {
					//Follow
					this.user.provFollowing = true;
					this.authService.currentUser.followingNumber += 1;
					this.user.followersNumber += 1;
					this.authService.currentUser.following.push(this.user._id);
					this.authService.follow(this.user._id)
						.subscribe(() => {
							this.webSocketService.emitPost(null, "follow", this.user._id, this.authService.currentUser._id);
						},
							(err) => {
								this.authService.errorMessage = err;
								setTimeout(() => {
									this.authService.errorMessage = null;
								}, 5000);
							});
	
				}
			}
		} else {
			//Mandar a signup
			this.authService.toggleAccess = true;
			this.authService.register = true;
			this.authService.toggleLogin = false;
				
		}

	

	}


}