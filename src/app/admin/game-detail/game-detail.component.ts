import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';

import { AdminService } from '../../core/admin.service';

@Component({
    selector: 'game-detail',
    templateUrl: "game-detail.component.html",
    styleUrls: ["game-detail.component.scss"]
})
export class GameDetailComponent implements OnInit {

    @Input() game: any;
    @Output() removeGame: EventEmitter<any> = new EventEmitter<any>();
    date: String;
    showDetail: boolean = false;
    loading: boolean = false;
    gameForm: FormGroup;
    gameSoccerForm: FormGroup;
    gameNHLForm: FormGroup;
    gameMLBForm: FormGroup;
    updated: boolean = false;
    error: boolean = false;
    updateRecord: boolean = true;
    mistake: boolean = false;
    updateRecordText: string = "YES";
    updateScoreboardText: string = "NO";
    theGameWentToOTSO: boolean = false;
    mistakeText: string = "NO";

    minute: number;
    team: string;
    player: string;

    homeTeamGoals: any[] = [];
    awayTeamGoals: any[] = [];

    awayInnings: number[] = [];
    awayTeamPointsR: number = 0;
    awayTeamPointsH: number = 0;
    awayTeamPointsE: number = 0;


    homeInnings: number[] = [];
    homeTeamPointsR: number = 0;
    homeTeamPointsH: number = 0;
    homeTeamPointsE: number = 0;


    

    constructor(private formBuilder: FormBuilder, private adminService: AdminService) { }

    ngOnInit() {
        
        this.buildForm();
        this.buildSoccerForm();
        this.buildNHLForm();
        this.populateInnings();
    }


    populateInnings(){
        
        this.awayInnings = this.game.awayRuns.length > 0 ? this.game.awayRuns : [0,0,0,0,0,0,0,0,0]
        this.homeInnings = this.game.homeRuns.length > 0 ? this.game.homeRuns : [0,0,0,0,0,0,0,0,0]
     
        this.homeTeamPointsR = this.game.homeTeamPointsR ? this.game.homeTeamPointsR : 0;
        this.homeTeamPointsH = this.game.homeTeamPointsH ? this.game.homeTeamPointsH : 0;
        this.homeTeamPointsE = this.game.homeTeamPointsE ? this.game.homeTeamPointsE : 0;

        this.awayTeamPointsR = this.game.awayTeamPointsR ? this.game.awayTeamPointsR : 0;
        this.awayTeamPointsH = this.game.awayTeamPointsH ? this.game.awayTeamPointsH : 0;
        this.awayTeamPointsE = this.game.awayTeamPointsE ? this.game.awayTeamPointsE : 0;

    }

    addInning() {
        this.awayInnings.push(0)
        this.homeInnings.push(0)
    }

    deleteInning() {
        this.awayInnings.pop();
        this.homeInnings.pop();
    }


    customTrackBy(index: number, obj: any): any {
        return index;
      }

    updateScoreboard() {
        this.theGameWentToOTSO = !this.theGameWentToOTSO;
        if(this.theGameWentToOTSO) this.updateScoreboardText = "YES";
        else { this.updateScoreboardText = "NO"}
    }


    updateTeamRecord() {
        this.updateRecord = !this.updateRecord;
        if(this.updateRecord) this.updateRecordText = "YES";
        else { this.updateRecordText = "NO"}
    }

    updateMistake() {
        this.mistake = !this.mistake;
        if(this.mistake) this.mistakeText = "YES";
        else { this.mistakeText = "NO"}
    }


    addGoal() {

        if(!this.player || !this.team || !this.minute) {

            return alert('One or more fields are empty')
        
        }

        if(this.team == this.game.homeTeam.abbreviation){

            if (confirm("Player: " + this.player + "\nMinute: " + this.minute + "\nTeam: " + this.team)) {
                let data = {
                    player: this.player,
                    minute: this.minute
                }
                this.homeTeamGoals.push(data)
                this.player = "";
                this.team = "";
                this.minute = 0;
                
            }
            //HOME

        } else {

            //AWAY

            if (confirm("Player: " + this.player + "\nMinute:b" + this.minute + "\nTeam: " + this.team)) {
                let data = {
                    player: this.player,
                    minute: this.minute
                }
                this.awayTeamGoals.push(data)
                this.player = "";
                this.team = "";
                this.minute = 0;
                
            }

        }
    }

    buildForm() {

        this.gameForm = this.formBuilder.group({
            awayTeamPoints1: [this.game.awayTeamPoints1 || 0, Validators.required],
            awayTeamPoints2: [this.game.awayTeamPoints2 || 0, Validators.required],
            awayTeamPoints3: [this.game.awayTeamPoints3 || 0, Validators.required],
            awayTeamPoints4: [this.game.awayTeamPoints4 || 0, Validators.required],
            awayTeamPointsOT: [this.game.awayTeamPointsOT || 0, Validators.required],
            homeTeamPoints1: [this.game.homeTeamPoints1 || 0, Validators.required],
            homeTeamPoints2: [this.game.homeTeamPoints2 || 0, Validators.required],
            homeTeamPoints3: [this.game.homeTeamPoints3 || 0, Validators.required],
            homeTeamPoints4: [this.game.homeTeamPoints4 || 0, Validators.required],
            homeTeamPointsOT: [this.game.homeTeamPointsOT || 0, Validators.required]
            
            
          
        });

        
    }



    initItemRows() {
        return this.formBuilder.group({
            // list all your form controls here, which belongs to your form array
            itemname: ['']
        });
    }



   

    buildSoccerForm() {
        this.gameSoccerForm = this.formBuilder.group({
            awayTeamScore: [this.game.awayTeamScore || 0, Validators.required],
            homeTeamScore: [this.game.homeTeamScore || 0, Validators.required],
            player: ["" || 0, Validators.required],
            minute: [0 || 0, Validators.required],
            team: [this.game.awayTeam.abbreviation || 0, Validators.required],
            awayTeamScorePenalties: [0],
            homeTeamScorePenalties: [0],
            

        });
    }

    buildNHLForm() {
        this.gameNHLForm = this.formBuilder.group({
            awayTeamPoints1: [this.game.awayTeamPoints1 || 0, Validators.required],
            awayTeamPoints2: [this.game.awayTeamPoints2 || 0, Validators.required],
            awayTeamPoints3: [this.game.awayTeamPoints3 || 0, Validators.required],
            awayTeamPointsOT: [this.game.awayTeamPointsOT || 0, Validators.required],
            awayTeamPointsSO: [this.game.awayTeamPointsSO || 0, Validators.required],
            homeTeamPoints1: [this.game.homeTeamPoints1 || 0, Validators.required],
            homeTeamPoints2: [this.game.homeTeamPoints2 || 0, Validators.required],
            homeTeamPoints3: [this.game.homeTeamPoints3 || 0, Validators.required],
            homeTeamPointsOT: [this.game.homeTeamPointsOT || 0, Validators.required],
            homeTeamPointsSO: [this.game.homeTeamPointsSO || 0, Validators.required]
            
        });
    }

    submit(formValues: any) {
        
        this.loading = true;
        formValues.updateRecord = this.updateRecord;
        formValues.mistake = this.mistake;
        formValues.awayTeamScore = formValues.awayTeamPoints1 + formValues.awayTeamPoints2 + formValues.awayTeamPoints3 + formValues.awayTeamPoints4 + formValues.awayTeamPointsOT;
        formValues.homeTeamScore = formValues.homeTeamPoints1 + formValues.homeTeamPoints2 + formValues.homeTeamPoints3 + formValues.homeTeamPoints4 + formValues.homeTeamPointsOT;
        

        this.adminService.updateGame(formValues, this.game._id)
                        .subscribe(() => {
                            this.game.awayTeamScore = formValues.awayTeamScore;
                            this.game.homeTeamScore = formValues.homeTeamScore;
                            this.loading = false;
                            this.updated = true;
                            setTimeout(() =>{ this.updated = false; }, 5000);
                        },
                        (err)=> { console.log(err); this.loading = false; });

    }

    submitSoccer(formValues: any) {

        this.loading = true;
        formValues.homeTeamGoals = this.homeTeamGoals;
        formValues.awayTeamGoals =  this.awayTeamGoals;
        this.adminService.updateGame(formValues, this.game._id)
                        .subscribe(() => {
                            this.game.awayTeamScore = formValues.awayTeamScore;
                            this.game.homeTeamScore = formValues.homeTeamScore;
                            this.loading = false;
                            this.updated = true;
                            setTimeout(() =>{ this.updated = false; }, 5000);
                        },
                        (err)=> { console.log(err); this.loading = false; });

    }

    submitMLB() {

        if(this.awayInnings.length >= 9 && this.homeInnings.length >= 9) {

        this.loading = true;
        let data = {
            awayRuns: this.awayInnings,
            homeRuns: this.homeInnings,
            homeTeamScore: this.homeTeamPointsR,
            awayTeamScore: this.awayTeamPointsR,
            awayTeamR: this.awayTeamPointsR,
            awayTeamH: this.awayTeamPointsH,
            awayTeamE: this.awayTeamPointsE,
            homeTeamR: this.homeTeamPointsR,
            homeTeamH: this.homeTeamPointsH,
            homeTeamE: this.homeTeamPointsE

        }
        
        this.adminService.updateGame(data, this.game._id)
                        .subscribe(() => {
                            this.game.awayTeamScore = data.awayTeamScore;
                            this.game.homeTeamScore = data.homeTeamScore;
                            this.loading = false;
                            this.updated = true;
                            setTimeout(() =>{ this.updated = false; }, 5000);
                        },
                        (err)=> { console.log(err); this.loading = false; });

        } else {
            alert('Baseball matches have at least 9 innings')
        }
        
        

    }


    submitNHL(formValues: any) {
        
        this.loading = true;
        formValues.updateRecord = this.updateRecord;
        formValues.mistake = this.mistake;
        let soPointsHome = formValues.homeTeamPointsSO > formValues.awayTeamPointsSO ? 1 : 0;
        let soPointsAway = formValues.homeTeamPointsSO < formValues.awayTeamPointsSO ? 1 : 0;
        formValues.awayTeamScore = formValues.awayTeamPoints1 + formValues.awayTeamPoints2 + formValues.awayTeamPoints3 + formValues.awayTeamPointsOT + soPointsAway;
        formValues.homeTeamScore = formValues.homeTeamPoints1 + formValues.homeTeamPoints2 + formValues.homeTeamPoints3 + formValues.homeTeamPointsOT + soPointsHome;
        if (formValues.homeTeamScore == formValues.awayTeamScore) {
            this.loading = false;
            return  alert("It can't end as a draw");
        }

        this.adminService.updateGame(formValues, this.game._id)
                        .subscribe(() => {
                            this.game.awayTeamScore = formValues.awayTeamScore;
                            this.game.homeTeamScore = formValues.homeTeamScore;
                            this.loading = false;
                            this.updated = true;
                            setTimeout(() =>{ this.updated = false; }, 5000);
                        },
                        (err)=> { console.log(err); this.loading = false; });

    }

    delete() {

        if (confirm("Do you want to delete this game?")) { 
            
            this.loading = true;
            let data = {gameId: this.game._id}
    
            this.adminService.deleteGame(data)
                            .subscribe((succeded) => {
                                
                                if (succeded) {
                                    this.showDetail = false;
                                    this.loading = false;
                                    this.removeGame.emit(this.game._id);
                                }
                            },
                            (err)=> {console.log(err); this.loading = false; });
    
            }
        }

       

    

}