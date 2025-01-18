import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AdminService } from '../../core/admin.service';


@Component({
    selector: 'team-detail',
    templateUrl: "team-detail.component.html",
    styles: [`
    li {
        background: white;
        margin-bottom: 15px;
        
    }

    .team-form {
        padding: 20px;
    }

    .main {
        position: relative;
        cursor: pointer;

    }
    
    li:hover {
        -moz-box-shadow: 0 2px 0  #18399B;
        -webkit-box-shadow: 0 2px 0 #18399B;
        box-shadow: 0 2px 0px  #18399B;
    }
    
    .team-pic {
        height: 60px;
        width: 60px;
        object-fit: contain;
        margin: 5px 20px 5px 8px;
    }
    
    .fa-angle-down, .fa-angle-up {
        position: absolute;
        right: 20px;
        top: 22px;
        font-size: 25px;
        color: #949494;
        
    }
    `]
})
export class TeamDetailComponent implements OnInit {

    @Input() team: any;
    showDetail: boolean = false;
    loading: boolean = false;
    teamForm: FormGroup;
    updated: boolean = false;
    error: boolean = false;
    possibleWinsAndLoses: number = 150;
    wins: number[] = [];
    loses: number[] = [];

    constructor(private formBuilder: FormBuilder, private adminService: AdminService) {}

    ngOnInit() {
        this.buildForm();
        this.populateWinsAndLoses();
    }

    
    buildForm() {
        this.teamForm = this.formBuilder.group({
            stadium: [this.team.stadium || ""],
            wins:  [this.team.wins || 0],
            loses:  [this.team.loses || 0],
            otl:  [this.team.otl || 0],
            background: [this.team.background || "", Validators.required]
          
        });
    }

    populateWinsAndLoses() {
        for (let index = 0; index < this.possibleWinsAndLoses; index++) {
            this.wins.push(index);
            this.loses.push(index);
        }
    }

    submit(formValues: any) {
        if(this.team.league != 'NHL') {
            formValues.otl = undefined;

        }
        if(this.team.league == 'Soccer') {
            formValues.wins = undefined;
            formValues.loses = undefined;

        }
        this.loading = true;
        this.adminService.updateTeam(formValues, this.team._id)
                        .subscribe(()=> {
                            this.updated = true;
                            this.loading = false;
                            setTimeout(() =>{ this.updated = false; }, 5000);
                        },
                        (err)=> {this.loading = false;})
    }




}