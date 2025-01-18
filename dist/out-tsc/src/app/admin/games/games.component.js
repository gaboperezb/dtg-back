import { __decorate } from "tslib";
import { Component } from '@angular/core';
import { Validators } from '@angular/forms';
let GamesComponent = class GamesComponent {
    constructor(formBuilder, adminService, authService) {
        this.formBuilder = formBuilder;
        this.adminService = adminService;
        this.authService = authService;
        this.skipNBA = 0;
        this.skipNFL = 0;
        this.skipNHL = 0;
        this.skipSoccer = 0;
        this.updated = false;
        this.fetchingDiscussions = false;
        this.loading = false;
        this.add = false;
        this.league = "NFL"; //FORM
        this.filterBy = "NBA";
        this.teams = [];
        this.games = [];
        this.clickedNflDirty = false;
        this.clickedSoccerDirty = false;
        this.clickedNHLDirty = false;
        this.clickedMLBDirty = false;
        this.clickedNCAABDirty = false;
    }
    ngOnInit() {
        this.buildForm();
        this.getTeams();
        this.getGames();
    }
    deleteGame(id) {
        this.games = this.games.filter((game) => game._id !== id);
        this.filterGames(this.filterBy);
    }
    filterGames(filter) {
        this.filterBy = filter;
        this.visibleGames = this.games.filter((game) => {
            return game.league == filter;
        });
    }
    getNflGames() {
        this.filterBy = "NFL";
        if (!this.clickedNflDirty) {
            this.adminService.getGames(0, this.filterBy)
                .subscribe((games) => {
                this.clickedNflDirty = true;
                this.fetchingDiscussions = false;
                let newGames = this.games.concat(games);
                this.games = newGames;
                this.filterGames(this.filterBy);
            }, (err) => {
                this.fetchingDiscussions = false;
            });
        }
        else {
            this.filterGames(this.filterBy);
        }
    }
    getNhlGames() {
        this.filterBy = "NHL";
        if (!this.clickedNHLDirty) {
            this.adminService.getGames(0, this.filterBy)
                .subscribe((games) => {
                this.clickedNHLDirty = true;
                this.fetchingDiscussions = false;
                let newGames = this.games.concat(games);
                this.games = newGames;
                this.filterGames(this.filterBy);
            }, (err) => {
                this.fetchingDiscussions = false;
            });
        }
        else {
            this.filterGames(this.filterBy);
        }
    }
    getNCAABGames() {
        this.filterBy = "NCAAB";
        if (!this.clickedMLBDirty) {
            this.adminService.getGames(0, this.filterBy)
                .subscribe((games) => {
                this.clickedNCAABDirty = true;
                this.fetchingDiscussions = false;
                let newGames = this.games.concat(games);
                this.games = newGames;
                this.filterGames(this.filterBy);
            }, (err) => {
                this.fetchingDiscussions = false;
            });
        }
        else {
            this.filterGames(this.filterBy);
        }
    }
    getMLBGames() {
        this.filterBy = "MLB";
        if (!this.clickedMLBDirty) {
            this.adminService.getGames(0, this.filterBy)
                .subscribe((games) => {
                this.clickedMLBDirty = true;
                this.fetchingDiscussions = false;
                let newGames = this.games.concat(games);
                this.games = newGames;
                this.filterGames(this.filterBy);
            }, (err) => {
                this.fetchingDiscussions = false;
            });
        }
        else {
            this.filterGames(this.filterBy);
        }
    }
    getSoccerGames() {
        this.filterBy = "Soccer";
        if (!this.clickedSoccerDirty) {
            this.adminService.getGames(0, this.filterBy)
                .subscribe((games) => {
                this.clickedSoccerDirty = true;
                this.fetchingDiscussions = false;
                let newGames = this.games.concat(games);
                this.games = newGames;
                this.filterGames(this.filterBy);
            }, (err) => {
                this.fetchingDiscussions = false;
            });
        }
        else {
            this.filterGames(this.filterBy);
        }
    }
    buildForm() {
        this.addTeamForm = this.formBuilder.group({
            league: ["NFL", Validators.required],
            awayTeam: ["", Validators.required],
            homeTeam: ["", Validators.required],
            seasonYear: ["2017", Validators.required],
            seasonType: ["Regular", Validators.required],
            gameDate: [, Validators.required],
            week: [""]
        });
    }
    getTeams() {
        this.adminService.getTeams()
            .subscribe((teams) => {
            this.teams = teams;
        });
    }
    getGames() {
        this.adminService.getGames(0, this.filterBy)
            .subscribe((games) => {
            this.games = games;
            this.filterGames(this.filterBy);
        }, (err) => {
        });
    }
    fetchMoreGames() {
        this.fetchingDiscussions = true;
        if (this.filterBy == "NBA") {
            this.skipNBA += 20;
            this.skip = this.skipNBA;
        }
        else if (this.filterBy == "NFL") {
            this.skipNFL += 20;
            this.skip = this.skipNFL;
        }
        else if (this.filterBy == "NHL") {
            this.skipNHL += 20;
            this.skip = this.skipNHL;
        }
        else if (this.filterBy == "Soccer") {
            this.skipSoccer += 20;
            this.skip = this.skipSoccer;
        }
        this.adminService.getGames(this.skip, this.filterBy)
            .subscribe((games) => {
            this.fetchingDiscussions = false;
            let newGames = this.games.concat(games);
            this.games = newGames;
            this.filterGames(this.filterBy);
        }, (err) => {
            this.fetchingDiscussions = false;
        });
    }
    submit(formValues) {
        if (this.league != "NFL")
            formValues.week = undefined;
        var arr = formValues.gameDate.split(/[-:T]/), date = new Date(arr[0], arr[1] - 1, arr[2], arr[3], arr[4]);
        formValues.gameDate = date;
        var awayTeam = this.teams.find(function (element) {
            return element._id.toString() == formValues.awayTeam.toString();
        });
        var homeTeam = this.teams.find(function (element) {
            return element._id.toString() == formValues.homeTeam.toString();
        });
        formValues.pollValues = [homeTeam.teamName, awayTeam.teamName];
        this.loading = true;
        this.adminService.addGame(formValues)
            .subscribe((game) => {
            this.loading = false;
            this.addTeamForm.controls['awayTeam'].reset();
            this.addTeamForm.controls['homeTeam'].reset();
            this.updated = true;
            this.games.unshift(game);
            this.filterGames(game.league);
            setTimeout(() => { this.updated = false; }, 5000);
        }, (err) => { this.loading = false; });
    }
};
GamesComponent = __decorate([
    Component({
        templateUrl: 'games.component.html',
        styleUrls: ['games.component.scss']
    })
], GamesComponent);
export { GamesComponent };
//# sourceMappingURL=games.component.js.map