import { __decorate, __param } from "tslib";
import { Component, Output, EventEmitter, Inject } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
let ChooseLeaguesComponent = class ChooseLeaguesComponent {
    constructor(router, platformId, authService, threadsService) {
        this.router = router;
        this.platformId = platformId;
        this.authService = authService;
        this.threadsService = threadsService;
        this.errorEmitter = new EventEmitter();
        this.leagues = [];
        this.selectedLeagues = [];
        this.showLikeHelp = false;
        this.loading = false;
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
        if (this.authService.currentUser) {
            this.selectedLeagues = this.authService.currentUser.leagues;
            this.leagues = this.leagues.map((league) => {
                if (this.selectedLeagues.some(selected => selected == league.league))
                    league.selected = true;
                return league;
            });
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
        console.log(this.selectedLeagues.length);
        if (this.selectedLeagues.length > 0) {
            this.loading = true;
            this.threadsService.leagues = this.selectedLeagues;
            this.authService.currentUser.leagues = this.selectedLeagues;
            this.threadsService.populateMenu();
            if (this.authService.isLoggedIn()) {
                let data = {
                    leagues: this.selectedLeagues.filter(league => league != 'TOP')
                };
                this.authService.saveLeagues(data)
                    .subscribe((leagues) => {
                    this.loading = false;
                    this.authService.toggleAccess = false;
                    this.authService.chooseLeagues = false;
                    this.authService.teams = false;
                    this.authService.register = false;
                }, (err) => {
                    this.errorEmitter.emit({});
                });
            }
            else {
                this.loading = false;
            }
        }
        else {
            let error = 'You need to select at least one';
        }
    }
    addLeague(league) {
        if (league.selected) {
            this.selectedLeagues = this.selectedLeagues.filter(leagueToDelete => leagueToDelete != league.league);
            console.log(this.selectedLeagues);
            league.selected = false;
        }
        else {
            this.selectedLeagues.push(league.league);
            league.selected = true;
        }
    }
};
__decorate([
    Output()
], ChooseLeaguesComponent.prototype, "errorEmitter", void 0);
ChooseLeaguesComponent = __decorate([
    Component({
        selector: 'app-choose-leagues',
        templateUrl: 'choose-leagues.component.html',
        styleUrls: ['./choose-leagues.component.scss'],
    }),
    __param(1, Inject(PLATFORM_ID))
], ChooseLeaguesComponent);
export { ChooseLeaguesComponent };
//# sourceMappingURL=choose-leagues.component.js.map