import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AdminService } from '../../core/admin.service';
import { AuthService } from '../../core/auth.service';


@Component({
    templateUrl: 'teams.component.html',
    styleUrls: ['teams.component.scss']
})
export class TeamsComponent implements OnInit {

    addForm: FormGroup;
    updated: boolean = false;
    teams: any = [];
    visibleTeams: any;
    add: boolean = false;
    showDetail: boolean = false;
    loading: boolean = false;
    dbError: string;
    filterBy: string = "NFL";

    ngOnInit() {
        
        this.getTeams();
        this.buildForm();
        
    }

    constructor(private formBuilder: FormBuilder, private adminService: AdminService, private authService: AuthService) {}

    getTeams() {
        this.adminService.getTeams()
                        .subscribe((teams: any) => {
                          
                            this.teams = teams;
                            this.filterGames(this.filterBy);
                        },
                        (err) => {
                            
                            this.authService.errorMessage = err;
                        });

    }

    buildForm() {
        this.addForm = this.formBuilder.group({
            
            logo: ["", Validators.required],
            teamName:  ["" ,Validators.required],
            abbreviation:  ["", Validators.required],
            league:     ["NFL", Validators.required],
            soccerLeague:     [""]
          
        });
    }

    filterGames(filter: string) {
        this.filterBy = filter;
        this.visibleTeams = this.teams.filter(team => {
            return team.league == filter;
        })
        
    }

    submit(formValues: any) {
        this.loading = true;
        this.adminService.addTeam(formValues)
                        .subscribe((team:  any) => {
                            this.loading = false;
                            this.addForm.reset();
                            this.updated = true;
                            this.teams.push(team);
                            setTimeout(() =>{ this.updated = false; }, 5000);

                        },
                        (err)=> {
                            this.loading = false;
                            this.authService.errorMessage = err;
                        })

    }

}