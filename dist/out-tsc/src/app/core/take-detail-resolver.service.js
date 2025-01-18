import { __decorate, __param } from "tslib";
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { isPlatformServer, isPlatformBrowser } from '@angular/common';
import { makeStateKey } from '@angular/platform-browser';
let TakeDetailResolverService = class TakeDetailResolverService {
    constructor(takeService, authService, router, platformId, transferState) {
        this.takeService = takeService;
        this.authService = authService;
        this.router = router;
        this.platformId = platformId;
        this.transferState = transferState;
    }
    resolve(route, state) {
        let takeId = route.params.id;
        const TAKE_KEY = makeStateKey('take-' + takeId);
        if (isPlatformServer(this.platformId)) { //PARA EVITAR @CACHEABLE EN SERVIDOR
            return this.takeService.getTakeDBUniversal(takeId).pipe(map((take) => {
                return { take };
            }), tap(data => {
                this.transferState.set(TAKE_KEY, data.take);
            }), catchError(error => {
                if (isPlatformBrowser(this.platformId)) {
                    this.authService.errorMessage = "Not found";
                    setTimeout(() => {
                        this.authService.errorMessage = null;
                    }, 5000);
                }
                this.router.navigateByUrl('/');
                return of({ error });
            }));
        }
        else {
            if (this.transferState.hasKey(TAKE_KEY)) {
                const take = this.transferState.get(TAKE_KEY, null);
                this.transferState.remove(TAKE_KEY);
                return of({ take });
            }
            else {
                return this.takeService.getTakeDB(takeId).pipe(map((take) => {
                    return { take };
                }), catchError(error => {
                    if (isPlatformBrowser(this.platformId)) {
                        this.authService.errorMessage = "Not found";
                        setTimeout(() => {
                            this.authService.errorMessage = null;
                        }, 5000);
                    }
                    this.router.navigateByUrl('/');
                    return of({ error });
                }));
            }
        }
    }
};
TakeDetailResolverService = __decorate([
    Injectable({
        providedIn: 'root'
    }),
    __param(3, Inject(PLATFORM_ID))
], TakeDetailResolverService);
export { TakeDetailResolverService };
//# sourceMappingURL=take-detail-resolver.service.js.map