import { __decorate, __param } from "tslib";
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { isPlatformServer, isPlatformBrowser } from '@angular/common';
import { makeStateKey } from '@angular/platform-browser';
let ThreadDetailResolverService = class ThreadDetailResolverService {
    constructor(threadService, authService, router, transferState, platformId) {
        this.threadService = threadService;
        this.authService = authService;
        this.router = router;
        this.transferState = transferState;
        this.platformId = platformId;
    }
    resolve(route, state) {
        let threadId = route.params.id;
        const THREAD_KEY = makeStateKey('thread-' + threadId);
        if (isPlatformServer(this.platformId)) { //PARA EVITAR @CACHEABLE EN SERVIDOR
            return this.threadService.getThreadDBUniversal(threadId).pipe(map((thread) => {
                return { thread };
            }), tap(data => {
                this.transferState.set(THREAD_KEY, data.thread);
            }), catchError(error => {
                this.router.navigateByUrl('/');
                return of({ error });
            }));
        }
        else {
            if (this.transferState.hasKey(THREAD_KEY)) {
                console.log('ii');
                const thread = this.transferState.get(THREAD_KEY, null);
                console.log(thread);
                this.transferState.remove(THREAD_KEY);
                return of({ thread });
            }
            else {
                return this.threadService.getThreadDB(threadId).pipe(map((thread) => {
                    return { thread };
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
ThreadDetailResolverService = __decorate([
    Injectable({
        providedIn: 'root'
    }),
    __param(4, Inject(PLATFORM_ID))
], ThreadDetailResolverService);
export { ThreadDetailResolverService };
//# sourceMappingURL=thread-detail-resolver.service.js.map