import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
let UserRepliesResolver = class UserRepliesResolver {
    constructor(adminService, router) {
        this.adminService = adminService;
        this.router = router;
    }
    resolve(route, state) {
        let id = route.params['id'];
        return this.adminService.getUserReplies(id, 0)
            .pipe(map((discussions) => {
            if (discussions) {
                discussions.forEach((discussion) => {
                    discussion.answers.date = new Date(discussion.answers.date);
                    this.created(discussion.answers);
                });
                return discussions;
            }
            return null;
        }), catchError(error => {
            this.router.navigateByUrl('/');
            return of(null);
        }));
    }
    created(thread) {
        let milliseconds = thread.date.getTime();
        let now = new Date();
        let millisecondsNow = now.getTime();
        let diffInHours = (millisecondsNow - milliseconds) / (1000 * 60 * 60); //hours
        if (diffInHours >= 24) {
            //DAYS
            let timeout = 1000 * 60 * 60 * 24;
            thread.threadCreated = Math.floor(diffInHours / 24); //Template binding
            if (thread.threadCreated == 1)
                thread.typeTime = "day";
            else
                thread.typeTime = "days";
            let myFunction = () => {
                thread.threadCreated += 1;
                setTimeout(myFunction, timeout);
            };
            setTimeout(myFunction, timeout);
        }
        else if (diffInHours < 1 && diffInHours > 0) {
            //MINUTES
            let timeout = 1000 * 60;
            thread.threadCreated = Math.ceil(diffInHours * 60); //Template binding
            if (thread.threadCreated == 1)
                thread.typeTime = "minute";
            else
                thread.typeTime = "minutes";
            let myFunction = () => {
                thread.threadCreated += 1;
                if (thread.threadCreated == 60)
                    return this.created(thread);
                setTimeout(myFunction, timeout);
            };
            setTimeout(myFunction, timeout);
        }
        else {
            //HOURS   
            let timeout = 1000 * 60 * 60;
            thread.threadCreated = Math.floor(diffInHours); //Template binding
            if (thread.threadCreated == 1)
                thread.typeTime = "hour";
            else
                thread.typeTime = "hours";
            let myFunction = () => {
                thread.threadCreated += 1;
                if (thread.threadCreated == 24)
                    return this.created(thread);
                setTimeout(myFunction, timeout);
            };
            setTimeout(myFunction, timeout);
        }
    }
};
UserRepliesResolver = __decorate([
    Injectable({ providedIn: 'root' })
], UserRepliesResolver);
export { UserRepliesResolver };
//# sourceMappingURL=user-replies.resolver.service.js.map