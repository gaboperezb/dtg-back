import { __decorate } from "tslib";
import { Component } from '@angular/core';
import { Validators } from '@angular/forms';
import { ValidationService } from '../shared/validators.service';
let PwdForgotComponent = class PwdForgotComponent {
    constructor(formBuilder, authService, router) {
        this.formBuilder = formBuilder;
        this.authService = authService;
        this.router = router;
    }
    ngOnInit() {
        this.buildForm();
    }
    buildForm() {
        this.forgotForm = this.formBuilder.group({
            email: ["", [Validators.required, ValidationService.emailValidator]]
        });
    }
    submit(formValues) {
        this.authService.forgot(formValues)
            .subscribe((data) => {
            if (data.successMessage) {
                this.authService.successMessage = data.successMessage;
            }
            else {
                this.authService.errorMessage = data.errorMessage;
            }
            ;
        }, (err) => {
            this.authService.errorMessage = err;
        });
    }
};
PwdForgotComponent = __decorate([
    Component({
        selector: 'app-pwd-forgot',
        templateUrl: './pwd-forgot.component.html',
        styleUrls: ['./pwd-forgot.component.scss']
    })
], PwdForgotComponent);
export { PwdForgotComponent };
//# sourceMappingURL=pwd-forgot.component.js.map