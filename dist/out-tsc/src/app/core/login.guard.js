import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
let LoginGuard = class LoginGuard {
    constructor(authService, router) {
        this.authService = authService;
        this.router = router;
    }
    canActivate(route, state) {
        return this.checkLogin();
    }
    checkLogin() {
        if (!this.authService.isLoggedIn()) {
            return true;
        }
        return false;
    }
};
LoginGuard = __decorate([
    Injectable({
        providedIn: 'root'
    })
], LoginGuard);
export { LoginGuard };
//# sourceMappingURL=login.guard.js.map