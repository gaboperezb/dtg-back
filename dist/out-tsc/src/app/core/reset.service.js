import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
let ResetResolver = class ResetResolver {
    constructor(authService, router) {
        this.authService = authService;
        this.router = router;
    }
    resolve(route, state) {
        let token = route.params['token'];
        return this.authService.getReset(token)
            .pipe(map((data) => {
            if (data.status) {
                return data.status;
            }
            let error = data.errorMessage || "Token expired";
            this.router.navigate(['/'], { queryParams: { resetError: error } });
            return null;
        }), catchError(error => {
            this.router.navigateByUrl('/');
            return of(null);
        }));
    }
};
ResetResolver = __decorate([
    Injectable({
        providedIn: 'root'
    })
], ResetResolver);
export { ResetResolver };
//# sourceMappingURL=reset.service.js.map