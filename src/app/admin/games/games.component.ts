import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AdminService } from '../../core/admin.service';
import { AuthService } from '../../core/auth.service';

@Component({
    templateUrl: 'games.component.html',
    styleUrls: ['games.component.scss']
})
export class GamesComponent implements OnInit {

    skipNBA: number = 0;
    skipNFL: number = 0;
    skipNHL: number = 0;
    skipSoccer: number = 0;
    updated: boolean = false;
    fetchingDiscussions: boolean = false;
    loading: boolean = false;
    add: boolean = false;
    league: string = "NFL"; //FORM
    filterBy: string = "NBA";
    teams: any[] = [];
    games: any[] = [];
    visibleGames: any[];
    skip: number;
    addTeamForm: FormGroup;
    clickedNflDirty: boolean = false;
    clickedSoccerDirty: boolean = false;
    clickedNHLDirty: boolean = false;
    clickedMLBDirty: boolean = false;
    clickedNCAABDirty: boolean = false;



    constructor(private formBuilder: FormBuilder, private adminService: AdminService, private authService: AuthService) { }


    ngOnInit() {

        this.buildForm();
        this.getTeams();
        this.getGames();

    }

    deleteGame(id: string) {
        this.games = this.games.filter((game: any) => game._id !== id);
        this.filterGames(this.filterBy);

    }

    filterGames(filter: string) {
        this.filterBy = filter;
        this.visibleGames = this.games.filter((game: any) => {
            return game.league == filter;
        })

    }


    getNflGames() {
        this.filterBy = "NFL";
        if (!this.clickedNflDirty) {
           
            this.adminService.getGames(0, this.filterBy)
                .subscribe((games: any) => {
                   
                    this.clickedNflDirty = true;
                    this.fetchingDiscussions = false;
                    let newGames = this.games.concat(games);
                    this.games = newGames;
                    this.filterGames(this.filterBy);

                },
                    (err) => {
                       
                        this.fetchingDiscussions = false;

                    });

        } else {
            this.filterGames(this.filterBy);

        }


    }

    getNhlGames() {
        this.filterBy = "NHL";
        if (!this.clickedNHLDirty) {
     
            this.adminService.getGames(0, this.filterBy)
                .subscribe((games: any) => {
                 
                    this.clickedNHLDirty = true;
                    this.fetchingDiscussions = false;
                    let newGames = this.games.concat(games);
                    this.games = newGames;
                    this.filterGames(this.filterBy);

                },
                    (err) => {
                    
                        this.fetchingDiscussions = false;

                    });

        } else {
            this.filterGames(this.filterBy);

        }


    }

    getNCAABGames() {
        this.filterBy = "NCAAB";
        if (!this.clickedMLBDirty) {
         
            this.adminService.getGames(0, this.filterBy)
                .subscribe((games: any) => {
               
                    this.clickedNCAABDirty = true;
                    this.fetchingDiscussions = false;
                    let newGames = this.games.concat(games);
                    this.games = newGames;
                    this.filterGames(this.filterBy);

                },
                    (err) => {
                    
                        this.fetchingDiscussions = false;

                    });

        } else {
            this.filterGames(this.filterBy);

        }

    }

    getMLBGames() {
        this.filterBy = "MLB";
        if (!this.clickedMLBDirty) {
      
            this.adminService.getGames(0, this.filterBy)
                .subscribe((games: any) => {
                    this.clickedMLBDirty = true;
                    this.fetchingDiscussions = false;
                    let newGames = this.games.concat(games);
                    this.games = newGames;
                    this.filterGames(this.filterBy);
                },
                    (err) => {
                        this.fetchingDiscussions = false;

                    });

        } else {
            this.filterGames(this.filterBy);

        }


    }

    getSoccerGames() {
        this.filterBy = "Soccer";
        if (!this.clickedSoccerDirty) {
           
            this.adminService.getGames(0, this.filterBy)
                .subscribe((games: any) => {
                   
                    this.clickedSoccerDirty = true;
                    this.fetchingDiscussions = false;
                    let newGames = this.games.concat(games);
                    this.games = newGames;
                    this.filterGames(this.filterBy);

                },
                    (err) => {
                     
                        this.fetchingDiscussions = false;

                    });

        } else {
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
            .subscribe((teams: any) => {
                this.teams = teams;
            })
    }

    getGames() {
        this.adminService.getGames(0, this.filterBy)
            .subscribe((games: any) => {
             
                this.games = games;
                this.filterGames(this.filterBy);
            },
                (err) => {
                    

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
            .subscribe((games: any) => {
                this.fetchingDiscussions = false;
                let newGames = this.games.concat(games);
                this.games = newGames;
                this.filterGames(this.filterBy);

            },
                (err) => {
                    this.fetchingDiscussions = false;

                });


    }

    submit(formValues: any) {

        if (this.league != "NFL") formValues.week = undefined;

        var arr = formValues.gameDate.split(/[-:T]/),
            date = new Date(arr[0], arr[1] - 1, arr[2], arr[3], arr[4]);
        formValues.gameDate = date;
        var awayTeam = this.teams.find(function (element) {
            return element._id.toString() == formValues.awayTeam.toString();
        });

        var homeTeam = this.teams.find(function (element) {
            return element._id.toString() == formValues.homeTeam.toString();
        });
        formValues.pollValues =[homeTeam.teamName, awayTeam.teamName];
        

            this.loading = true;
        this.adminService.addGame(formValues)
            .subscribe((game: any) => {
                this.loading = false;
                this.addTeamForm.controls['awayTeam'].reset();
                this.addTeamForm.controls['homeTeam'].reset();
                this.updated = true;
                this.games.unshift(game);
                this.filterGames(game.league);
                setTimeout(() => { this.updated = false; }, 5000);

            },
                (err) => { this.loading = false; })
    }






}