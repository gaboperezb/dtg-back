import { __decorate, __param } from "tslib";
import { Component, Inject } from '@angular/core';
import { Validators } from '@angular/forms';
import { ValidationService } from '../shared/validators.service';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
let LoginComponent = class LoginComponent {
    constructor(formBuilder, authService, router, renderer, platformId, threadsService) {
        this.formBuilder = formBuilder;
        this.authService = authService;
        this.router = router;
        this.renderer = renderer;
        this.platformId = platformId;
        this.threadsService = threadsService;
        this.loading = false;
        this.toggleLogin = false;
    }
    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.renderer.addClass(document.body, 'modal-open');
            this.buildForm();
            this.buildSignupForm();
        }
    }
    ngOnDestroy() {
        if (isPlatformBrowser(this.platformId)) {
            this.renderer.removeClass(document.body, 'modal-open');
        }
    }
    closeComponent() {
        this.authService.toggleAccess = false;
        this.authService.register = false;
        this.authService.chooseLeagues = false;
        this.authService.teams = false;
    }
    changeType(type) {
        if (type == 'login')
            this.authService.toggleLogin = true;
        else {
            this.authService.toggleLogin = false;
        }
    }
    buildForm() {
        this.loginForm = this.formBuilder.group({
            email: ["", [Validators.required]],
            password: ["", [Validators.required, ValidationService.passwordValidator]],
        });
    }
    buildSignupForm() {
        this.signupForm = this.formBuilder.group({
            username: ["", [Validators.required, ValidationService.usernameValidator]],
            email: ["", [Validators.required, ValidationService.emailValidator]],
            password: ["", [Validators.required, ValidationService.passwordValidator]],
            confirmPassword: ["", [Validators.required, ValidationService.passwordValidator]],
        });
    }
    forgotPassword() {
        this.authService.toggleAccess = false;
        this.authService.register = false;
        this.authService.chooseLeagues = false;
        this.authService.teams = false;
        this.router.navigate(['/pwd-forgot']);
    }
    errorEmitter() {
        this.authService.errorMessage = "There was en error, please try again later";
        setTimeout(() => {
            this.authService.errorMessage = null;
        }, 5000);
    }
    submitLogin(formValues) {
        if (isPlatformBrowser(this.platformId)) {
            let value = localStorage.getItem('blocked');
            if (!value) {
                this.loading = true;
                this.authService.login(formValues)
                    .subscribe((data) => {
                    if (data.user) {
                        if (data.user.leagues.length == 0) {
                            this.authService.register = false;
                            this.authService.chooseLeagues = true;
                            this.authService.teams = false;
                        }
                        else {
                            this.authService.toggleAccess = false;
                            this.authService.register = false;
                            this.authService.chooseLeagues = false;
                            this.authService.teams = false;
                        }
                    }
                    else {
                        this.authService.errorMessage = data.error;
                        setTimeout(() => {
                            this.authService.errorMessage = null;
                        }, 5000);
                    }
                    this.loading = false;
                }, (err) => {
                    this.loading = false;
                    this.authService.errorMessage = err;
                    setTimeout(() => {
                        this.authService.errorMessage = null;
                    }, 5000);
                });
            }
            else {
                this.loading = false;
                this.authService.errorMessage = "You have been banned";
                setTimeout(() => {
                    this.authService.errorMessage = null;
                }, 5000);
            }
        }
    }
    submitSignup(formValues) {
        if (isPlatformBrowser(this.platformId)) {
            let value = localStorage.getItem('blocked');
            if (!value) {
                formValues.username = formValues.username.toLowerCase();
                if (formValues.password != formValues.confirmPassword) {
                    this.authService.errorMessage = "The passwords don't match";
                    setTimeout(() => {
                        this.authService.errorMessage = null;
                    }, 5000);
                    return false;
                }
                if (formValues.username.length > 20) {
                    this.authService.errorMessage = "The username is too long";
                    setTimeout(() => {
                        this.authService.errorMessage = null;
                    }, 5000);
                    return false;
                }
                this.loading = true;
                this.authService.signup(formValues)
                    .subscribe((data) => {
                    if (data.user) {
                        //navegar
                        this.authService.chooseLeagues = true;
                        this.authService.teams = false;
                        this.authService.register = false;
                    }
                    else {
                        this.authService.errorMessage = data.error;
                        setTimeout(() => {
                            this.authService.errorMessage = null;
                        }, 5000);
                    }
                    this.loading = false;
                }, (err) => {
                    this.loading = false;
                    this.authService.errorMessage = err;
                    setTimeout(() => {
                        this.authService.errorMessage = null;
                    }, 5000);
                });
            }
            else {
                this.loading = false;
                this.authService.errorMessage = "You have been banned";
                setTimeout(() => {
                    this.authService.errorMessage = null;
                }, 5000);
            }
        }
    }
};
LoginComponent = __decorate([
    Component({
        selector: 'app-login',
        templateUrl: 'login.component.html',
        styleUrls: ['login.component.scss']
    }),
    __param(4, Inject(PLATFORM_ID))
], LoginComponent);
export { LoginComponent };
//# sourceMappingURL=login.component.js.map