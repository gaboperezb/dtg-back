import { __decorate, __param } from "tslib";
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformServer } from '@angular/common';
let AuthGuard = class AuthGuard {
    constructor(router, authService, platformId) {
        this.router = router;
        this.authService = authService;
        this.platformId = platformId;
    }
    canActivate(route, state) {
        if (isPlatformServer(this.platformId)) {
            return new Promise((resolve) => {
                resolve(true);
            });
        }
        else {
            return new Promise((resolve) => {
                var val = localStorage.getItem('user');
                if (!val) {
                    this.router.navigateByUrl('/');
                    this.authService.toggleAccess = true;
                    this.authService.register = true;
                    this.authService.toggleLogin = false;
                    resolve(false);
                }
                else {
                    resolve(true);
                }
            });
        }
    }
};
AuthGuard = __decorate([
    Injectable({ providedIn: 'root' }),
    __param(2, Inject(PLATFORM_ID))
], AuthGuard);
export { AuthGuard };
//# sourceMappingURL=auth.guard.js.map