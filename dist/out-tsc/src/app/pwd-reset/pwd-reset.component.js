import { __decorate } from "tslib";
import { Component } from '@angular/core';
import { Validators } from '@angular/forms';
import { ValidationService } from '../shared/validators.service';
let PwdResetComponent = class PwdResetComponent {
    constructor(formBuilder, authService, router, route) {
        this.formBuilder = formBuilder;
        this.authService = authService;
        this.router = router;
        this.route = route;
    }
    ngOnInit() {
        this.buildForm();
    }
    buildForm() {
        this.resetForm = this.formBuilder.group({
            password: ["", [Validators.required, ValidationService.passwordValidator]],
            confirmPassword: ["", [Validators.required,]]
        });
    }
    submit(formValues) {
        let token = this.route.snapshot.params['token'];
        this.authService.postReset(formValues, token)
            .subscribe((data) => {
            if (data.successMessage && data.user) {
                this.authService.successMessage = data.successMessage;
                setTimeout(() => {
                    this.authService.successMessage = null;
                    this.router.navigate(['/login']);
                }, 2000);
            }
            else {
                this.authService.errorMessage = data.error;
            }
            ;
        }, (err) => {
            this.authService.errorMessage = err;
        });
    }
};
PwdResetComponent = __decorate([
    Component({
        selector: 'app-pwd-reset',
        templateUrl: './pwd-reset.component.html',
        styleUrls: ['./pwd-reset.component.scss']
    })
], PwdResetComponent);
export { PwdResetComponent };
//# sourceMappingURL=pwd-reset.component.js.map