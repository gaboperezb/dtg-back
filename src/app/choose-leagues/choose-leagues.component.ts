import { Component, Output, EventEmitter, Inject } from '@angular/core';
import { AuthService } from '../../app/core/auth.service';
import { ThreadsService } from '../core/thread.service';
import { Router } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';



@Component({
	selector: 'app-choose-leagues',
	templateUrl: 'choose-leagues.component.html',
	styleUrls: ['./choose-leagues.component.scss'],

})
export class ChooseLeaguesComponent {


	@Output() errorEmitter = new EventEmitter();
	leagues: any[] = []
	selectedLeagues: string[] = [];
	showLikeHelp: boolean = false;
	loaderInstance: any;
	loading: boolean = false;
	errorMessage: string;


	constructor(
		private router: Router,
		@Inject(PLATFORM_ID) private platformId: Object,
		private authService: AuthService,
		private threadsService: ThreadsService) {

		this.leagues = [
			{
				league: 'NBA',
				selected: false,
				image: "assets/imgs/nba.png"
			},
			{
				league: 'NFL',
				selected: false,
				image: "assets/imgs/nfl.png"
			},
			{
				league: 'Soccer',
				selected: false,
				image: "assets/imgs/soccer.png"
			},
			{
				league: 'MLB',
				selected: false,
				image: "assets/imgs/mlb.png"
			},
			{
				league: 'NHL',
				selected: false,
				image: "assets/imgs/nhl.png"
			},
			{
				league: 'NCAAF',
				selected: false,
				image: "assets/imgs/ncaaf.png"
			},
			{
				league: 'NCAAB',
				selected: false,
				image: "assets/imgs/ncaab.png"
			},
			{
				league: 'NFL Fantasy',
				selected: false,
				image: "assets/imgs/nfl-fantasy.png"
			},
			{
				league: 'MMA',
				selected: false,
				image: "assets/imgs/mma.png"
			},
			{
				league: 'Boxing',
				selected: false,
				image: "assets/imgs/boxing.png"
			},
			{
				league: 'Tennis',
				selected: false,
				image: "assets/imgs/tennis.png"
			},
			{
				league: 'Golf',
				selected: false,
				image: "assets/imgs/golf.png"
			},
			{
				league: 'Motorsports',
				selected: false,
				image: "assets/imgs/motorsports.png"
			},
			{
				league: 'General',
				selected: false,
				image: "assets/imgs/general.png"
			}

		];


		if(this.authService.currentUser) {

			this.selectedLeagues = this.authService.currentUser.leagues;
			this.leagues = this.leagues.map((league) => {
				if (this.selectedLeagues.some(selected => selected == league.league)) league.selected = true;
				return league;
			})
		}
		
	}


	selectAll() {

		this.selectedLeagues = [];
		for (let index = 0; index < this.leagues.length; index++) {
			const element = this.leagues[index];
			element.selected = true;
			this.selectedLeagues.push(element.league);
		}
	}


	done() {

	
		if (this.selectedLeagues.length > 0) {

			this.loading = true;
			this.threadsService.leagues = this.selectedLeagues;
			this.authService.currentUser.leagues = this.selectedLeagues;
			this.threadsService.populateMenu();

			if (this.authService.isLoggedIn()) {
				
					let data = {
						leagues: this.selectedLeagues.filter(league => league != 'TOP')
					}
					this.authService.saveLeagues(data)
						.subscribe((leagues) => {

							this.loading = false;
							this.authService.toggleAccess = false;
							this.authService.chooseLeagues = false;
							this.authService.teams = false;
							this.authService.register = false;
							
							
						},
							(err) => {
								this.errorEmitter.emit({});
							})

			} else {
				this.loading = false;
			}
		}
		else {

			let error = 'You need to select at least one'
			
		}
	}

	addLeague(league) {


		if (league.selected) {
			this.selectedLeagues = this.selectedLeagues.filter(leagueToDelete => leagueToDelete != league.league)
	
			league.selected = false;
		} else {
			this.selectedLeagues.push(league.league);
			league.selected = true;
		}


	}


}

