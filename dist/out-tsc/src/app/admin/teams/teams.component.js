import { __decorate } from "tslib";
import { Component } from '@angular/core';
import { Validators } from '@angular/forms';
let TeamsComponent = class TeamsComponent {
    constructor(formBuilder, adminService, authService) {
        this.formBuilder = formBuilder;
        this.adminService = adminService;
        this.authService = authService;
        this.updated = false;
        this.teams = [];
        this.add = false;
        this.showDetail = false;
        this.loading = false;
        this.filterBy = "NFL";
    }
    ngOnInit() {
        this.getTeams();
        this.buildForm();
    }
    getTeams() {
        this.adminService.getTeams()
            .subscribe((teams) => {
            this.teams = teams;
            this.filterGames(this.filterBy);
        }, (err) => {
            this.authService.errorMessage = err;
        });
    }
    buildForm() {
        this.addForm = this.formBuilder.group({
            logo: ["", Validators.required],
            teamName: ["", Validators.required],
            abbreviation: ["", Validators.required],
            league: ["NFL", Validators.required],
            soccerLeague: [""]
        });
    }
    filterGames(filter) {
        this.filterBy = filter;
        this.visibleTeams = this.teams.filter(team => {
            return team.league == filter;
        });
    }
    submit(formValues) {
        this.loading = true;
        this.adminService.addTeam(formValues)
            .subscribe((team) => {
            this.loading = false;
            this.addForm.reset();
            this.updated = true;
            this.teams.push(team);
            setTimeout(() => { this.updated = false; }, 5000);
        }, (err) => {
            this.loading = false;
            this.authService.errorMessage = err;
        });
    }
};
TeamsComponent = __decorate([
    Component({
        templateUrl: 'teams.component.html',
        styleUrls: ['teams.component.scss']
    })
], TeamsComponent);
export { TeamsComponent };
//# sourceMappingURL=teams.component.js.map