import { __decorate, __param } from "tslib";
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { isPlatformServer } from '@angular/common';
let AdminGuard = class AdminGuard {
    constructor(authService, router, platformId) {
        this.authService = authService;
        this.router = router;
        this.platformId = platformId;
    }
    canActivate(route, state) {
        if (isPlatformServer(this.platformId)) {
            return true;
        }
        else {
            return this.checkAdmin();
        }
    }
    canLoad(route) {
        return this.authService.checkAuthenticationStatusForGuard()
            .pipe(map(e => {
            if (e) {
                return true;
            }
        }), catchError(() => {
            this.router.navigate(['/']);
            return of(false);
        }));
    }
    checkAdmin() {
        if (this.authService.currentUser.isAdmin) {
            return true;
        }
        // Navigate to the games page
        this.router.navigateByUrl('/');
        return false;
    }
};
AdminGuard = __decorate([
    Injectable({
        providedIn: 'root'
    }),
    __param(2, Inject(PLATFORM_ID))
], AdminGuard);
export { AdminGuard };
//# sourceMappingURL=admin.guard.js.map