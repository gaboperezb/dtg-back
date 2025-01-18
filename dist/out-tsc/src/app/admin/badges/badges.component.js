import { __decorate } from "tslib";
import { Component } from '@angular/core';
import { Validators } from '@angular/forms';
let BadgesComponent = class BadgesComponent {
    constructor(formBuilder, adminService, authService) {
        this.formBuilder = formBuilder;
        this.adminService = adminService;
        this.authService = authService;
        this.updated = false;
        this.badges = [];
        this.add = false;
        this.showDetail = false;
        this.loading = false;
        this.filterBy = "nfl";
    }
    ngOnInit() {
        this.getBadges();
        this.buildForm();
    }
    getBadges() {
        this.adminService.getBadges()
            .subscribe((badges) => {
            this.badges = badges;
        }, (err) => {
            this.authService.errorMessage = err;
        });
    }
    buildForm() {
        this.badgeForm = this.formBuilder.group({
            picture: ["", Validators.required],
            level: ["", Validators.required],
            name: ["", Validators.required],
            nextPoints: ["", Validators.required],
            nextPicture: ["", Validators.required],
            previousPoints: ["", Validators.required],
            nextName: ["", Validators.required]
        });
    }
    submit(formValues) {
        this.loading = true;
        this.adminService.addBadge(formValues)
            .subscribe((badge) => {
            this.loading = false;
            this.badgeForm.reset();
            this.updated = true;
            this.badges.push(badge);
            setTimeout(() => { this.updated = false; }, 5000);
        }, (err) => {
            this.loading = false;
            this.authService.errorMessage = err;
        });
    }
};
BadgesComponent = __decorate([
    Component({
        templateUrl: 'badges.component.html',
        styleUrls: ['badges.component.scss']
    })
], BadgesComponent);
export { BadgesComponent };
//# sourceMappingURL=badges.component.js.map