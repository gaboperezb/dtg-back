import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
let CommentResolverService = class CommentResolverService {
    constructor(threadDiscussionService, authService, router) {
        this.threadDiscussionService = threadDiscussionService;
        this.authService = authService;
        this.router = router;
    }
    resolve(route, state) {
        let id = route.params.id;
        return this.threadDiscussionService.getDiscussion(id).pipe(map((comment) => {
            return { comment };
        }), catchError(error => {
            this.authService.errorMessage = "Not found";
            setTimeout(() => {
                this.authService.errorMessage = null;
            }, 5000);
            this.router.navigateByUrl('/');
            this.authService.errorMessage = "Not found";
            setTimeout(() => {
                this.authService.errorMessage = null;
            }, 5000);
            this.router.navigateByUrl('/');
            return of({ error: error });
        }));
    }
};
CommentResolverService = __decorate([
    Injectable({
        providedIn: 'root'
    })
], CommentResolverService);
export { CommentResolverService };
//# sourceMappingURL=comment-resolver.service.js.map