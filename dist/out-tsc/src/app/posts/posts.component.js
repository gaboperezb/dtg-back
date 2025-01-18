import { __decorate } from "tslib";
import { Component } from '@angular/core';
let PostsComponent = class PostsComponent {
    constructor(authService, router, threadsService) {
        this.authService = authService;
        this.router = router;
        this.threadsService = threadsService;
        this.threads = [];
        this.loadingThreads = true;
        this.enableInfinite = true;
        this.loadingMore = false;
    }
    ngOnInit() {
        this.getThreads();
        this.authService.postsActive = true;
    }
    ngOnDestroy() {
        this.authService.postsActive = false;
    }
    edit(thread) {
        this.threadsService.threadToEdit = thread;
        this.router.navigateByUrl('/create');
    }
    getThreads(event) {
        this.skip = 0;
        ;
        this.loadingThreads = true;
        this.enableInfinite = true;
        this.authService.getProfile(0)
            .subscribe((user) => {
            let threads = user.threads;
            let prov = threads.map((thread) => {
                thread.date = new Date(thread.date);
                thread.created = this.created(thread);
                return thread;
            });
            this.loadingThreads = false;
            if (threads.length >= 15) {
                this.enableInfinite = true;
            }
            else {
                this.enableInfinite = false;
            }
            this.threads = prov;
        }, (err) => {
            this.authService.errorMessage = err;
            setTimeout(() => {
                this.authService.errorMessage = null;
            }, 3000);
            this.loadingThreads = false;
        });
    }
    getMorePosts() {
        this.skip += 15;
        this.loadingMore = true;
        this.authService.getProfile(this.skip)
            .subscribe((user) => {
            console.log(user.threads);
            let threads = user.threads;
            let prov = threads.map((thread) => {
                thread.date = new Date(thread.date);
                thread.created = this.created(thread);
                return thread;
            });
            if (threads.length < 15)
                this.enableInfinite = false;
            this.threads = this.threads.concat(prov);
            this.loadingMore = false;
        }, (err) => {
            this.authService.errorMessage = err;
            setTimeout(() => {
                this.authService.errorMessage = null;
            }, 3000);
            this.loadingMore = false;
        });
    }
    created(thread) {
        let milliseconds = thread.date.getTime();
        let now = new Date();
        let millisecondsNow = now.getTime();
        let diffInHours = (millisecondsNow - milliseconds) / (1000 * 60 * 60); //hours
        let typeTime;
        if (diffInHours >= 24) {
            //DAYS
            let threadCreated = Math.floor(diffInHours / 24); //Template binding
            typeTime = "d";
            return `${threadCreated}${typeTime}`;
        }
        else if (diffInHours < 1 && diffInHours > 0) {
            //MINUTES
            let threadCreated = Math.ceil(diffInHours * 60); //Template binding
            typeTime = "min";
            return `${threadCreated}${typeTime}`;
        }
        else {
            //HOURS   
            let threadCreated = Math.floor(diffInHours); //Template binding
            typeTime = "h";
            return `${threadCreated}${typeTime}`;
        }
    }
};
PostsComponent = __decorate([
    Component({
        selector: 'app-posts',
        templateUrl: './posts.component.html',
        styleUrls: ['./posts.component.scss']
    })
], PostsComponent);
export { PostsComponent };
//# sourceMappingURL=posts.component.js.map