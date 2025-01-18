import { __decorate, __param } from "tslib";
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { makeStateKey } from '@angular/platform-browser';
import { isPlatformServer } from '@angular/common';
let UserResolverService = class UserResolverService {
    constructor(authService, transferState, platformId) {
        this.authService = authService;
        this.transferState = transferState;
        this.platformId = platformId;
    }
    resolve(route, state) {
        let userId = route.params.username;
        const USER_KEY = makeStateKey('user-' + userId);
        if (isPlatformServer(this.platformId)) {
            return this.authService.getUserByUsername(userId).pipe(map((user) => {
                return { user };
            }), tap((data) => {
                this.transferState.set(USER_KEY, data.user);
            }), catchError(this.handleError));
        }
        else {
            if (this.transferState.hasKey(USER_KEY)) {
                const user = this.transferState.get(USER_KEY, null);
                this.transferState.remove(USER_KEY);
                return of({ user });
            }
            else {
                return this.authService.getUserByUsername(userId).pipe(map((user) => {
                    return { user };
                }), catchError(this.handleError));
            }
        }
    }
    handleError(error) {
        return of({ error: error });
    }
};
UserResolverService = __decorate([
    Injectable({
        providedIn: 'root'
    }),
    __param(2, Inject(PLATFORM_ID))
], UserResolverService);
export { UserResolverService };
//# sourceMappingURL=user-resolver.service.js.map