import { __decorate, __param } from "tslib";
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { isPlatformServer } from '@angular/common';
import { makeStateKey } from '@angular/platform-browser';
let FeaturedResolverService = class FeaturedResolverService {
    constructor(threadsService, platformId, transferState) {
        this.threadsService = threadsService;
        this.platformId = platformId;
        this.transferState = transferState;
    }
    resolve(route, state) {
        const FEATURED_KEY = makeStateKey('featured-');
        if (isPlatformServer(this.platformId)) {
            let league = this.threadsService.filterBy || 'TOP';
            return this.threadsService.getFeaturedUniversal(league, 0).pipe(map((threads) => {
                return { threads };
            }), tap((data) => {
                this.transferState.set(FEATURED_KEY, data.threads);
            }), catchError(this.handleError));
        }
        else {
            if (this.transferState.hasKey(FEATURED_KEY)) {
                const threads = this.transferState.get(FEATURED_KEY, null);
                this.transferState.remove(FEATURED_KEY);
                return of({ threads });
            }
            else {
                let league = this.threadsService.filterBy || 'TOP';
                return this.threadsService.getFeatured(league, 0).pipe(map((threads) => {
                    return { threads };
                }), catchError(this.handleError));
            }
        }
    }
    handleError(error) {
        return of({ error: error });
    }
};
FeaturedResolverService = __decorate([
    Injectable({
        providedIn: 'root'
    }),
    __param(1, Inject(PLATFORM_ID))
], FeaturedResolverService);
export { FeaturedResolverService };
//# sourceMappingURL=featured-resolver.service.js.map