import { __decorate } from "tslib";
import { Component } from '@angular/core';
import { Validators } from '@angular/forms';
let UsersComponent = class UsersComponent {
    constructor(formBuilder, adminService, authService) {
        this.formBuilder = formBuilder;
        this.adminService = adminService;
        this.authService = authService;
        this.loading = false;
        this.loadingAccount = false;
        this.loadingIP = false;
    }
    ngOnInit() {
        this.buildForm();
    }
    buildForm() {
        this.usernameForm = this.formBuilder.group({
            username: ["", Validators.required]
        });
    }
    submit(formValues) {
        this.loading = true;
        this.adminService.getUsers(formValues)
            .subscribe((users) => {
            this.loading = false;
            users.forEach(user => {
                user.timeSpent.timeSpent = (+user.timeSpent.timeSpent * 2.77778e-7).toFixed(2);
            });
            this.users = users;
            this.usernameForm.reset();
        }, (err) => {
            this.loading = false;
            this.authService.errorMessage = err;
        });
    }
};
UsersComponent = __decorate([
    Component({
        templateUrl: 'users.component.html',
        styleUrls: ['users.component.scss']
    })
], UsersComponent);
export { UsersComponent };
//# sourceMappingURL=users.component.js.map