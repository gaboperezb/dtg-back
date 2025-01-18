import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
let CanDeactivateGuard = class CanDeactivateGuard {
    constructor(authService, threadService) {
        this.authService = authService;
        this.threadService = threadService;
    }
    canDeactivate(component) {
        if (!this.authService.isLoggedIn() || this.threadService.posting) {
            return true;
        }
        else {
            return component.canDeactivate ? component.canDeactivate() : true;
        }
    }
};
CanDeactivateGuard = __decorate([
    Injectable({
        providedIn: 'root'
    })
], CanDeactivateGuard);
export { CanDeactivateGuard };
//# sourceMappingURL=can-deactivate-create.service.js.map