import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
let HomeGuard = class HomeGuard {
    constructor(router) {
        this.router = router;
    }
    canActivate(route, state) {
        return new Promise((resolve) => {
            var val = localStorage.getItem('user');
            if (!val) {
                resolve(true);
            }
            else {
                this.router.navigateByUrl('/create');
                resolve(false);
            }
        });
    }
};
HomeGuard = __decorate([
    Injectable({ providedIn: 'root' })
], HomeGuard);
export { HomeGuard };
//# sourceMappingURL=home.guard.js.map