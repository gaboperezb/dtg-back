import { __decorate } from "tslib";
import { Component } from '@angular/core';
let FeaturedComponent = class FeaturedComponent {
    constructor(authService, threadLikesService, likesService, seoSocialShareService, router, threadsService, route) {
        this.authService = authService;
        this.threadLikesService = threadLikesService;
        this.likesService = likesService;
        this.seoSocialShareService = seoSocialShareService;
        this.router = router;
        this.threadsService = threadsService;
        this.route = route;
        this.league = "";
        this.leagueToShow = ";";
        this.hideInfinite = false;
        this.skip = 0;
        this.showTitle = false;
        this.loadingFeatured = true;
        this.featuredThreads = [];
        this.enableInfinite = false;
        this.showInfiniteSpinner = false;
    }
    ngOnInit() {
        this.route.data
            .subscribe((data) => {
            if (data.data.error) {
                this.authService.errorMessage = "Not found";
                setTimeout(() => {
                    this.authService.errorMessage = null;
                }, 5000);
            }
            else {
                this.configureThreads(data.data.threads);
                this.configureSEO();
            }
        });
    }
    configureSEO() {
        let data = {
            title: "Featured Posts - Discuss TheGame",
            description: "Discuss TheGame is a community-powered platform for die-hard sports fans, where users talk sports, create content, share their sports opinions, and chat and connect with fans.",
            site: 'http://localhost:3000/featured',
            large: false,
            website: true
        };
        this.seoSocialShareService.setData(data);
    }
    configureThreads(threads) {
        let prov = threads.map((thread) => {
            thread.date = new Date(thread.date);
            thread.created = this.created(thread);
            thread.likedByUser = this.userHasLiked(thread);
            thread.count = thread.likers ? thread.likers.length : 0;
            thread.levelN = thread.user.badge.picture.replace('.png', 'N.png');
            let reducedText = thread.title.substring(0, 50);
            if (reducedText.length < thread.title.length) {
                thread.titleToShow = thread.title.substring(0, 50) + "...";
            }
            else {
                thread.titleToShow = thread.title;
            }
            return thread;
        });
        this.featuredThreads = prov;
        this.enableInfinite = true;
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
    userHasLiked(thread) {
        if (this.authService.currentUser) {
            return this.likesService.userHasLiked(thread, this.authService.currentUser._id);
        }
        else {
            return false;
        }
    }
    getMoreFeatured(league) {
        this.threadsService.getFeaturedForFeaturedPage(this.threadsService.filterBy, this.skip)
            .subscribe((threads) => {
            if (threads.length > 0) {
                let prov = threads.map((thread) => {
                    thread.date = new Date(thread.date);
                    thread.created = this.created(thread);
                    thread.likedByUser = this.userHasLiked(thread);
                    thread.count = thread.likers ? thread.likers.length : 0;
                    thread.levelN = thread.user.badge.picture.replace('.png', 'N.png');
                    let reducedText = thread.title.substring(0, 50);
                    if (reducedText.length < thread.title.length) {
                        thread.titleToShow = thread.title.substring(0, 50) + "...";
                    }
                    else {
                        thread.titleToShow = thread.title;
                    }
                    return thread;
                });
                let newThreadsArray = this.featuredThreads.concat(prov);
                //Eliminar duplicados. Esto sucede porque continuamente se agregan discusiones a la base de datos; el skip genera esto.
                let unique = newThreadsArray.filter((item, i, array) => {
                    return array.findIndex((item2) => { return item2._id == item._id; }) === i;
                });
                this.featuredThreads = unique;
            }
            else {
                this.enableInfinite = false;
            }
            this.showInfiniteSpinner = false;
        }, (err) => {
            this.showInfiniteSpinner = false;
            this.authService.errorMessage = err;
            setTimeout(() => {
                this.authService.errorMessage = null;
            }, 5000);
        });
    }
    deleteThread(threadId) {
        this.threadsService.featuredThreads = this.threadsService.featuredThreads.filter(_thread => _thread._id !== threadId);
    }
    doInfinite() {
        let path = this.router.url.split('?');
        if (this.showInfiniteSpinner || path[0] != '/featured')
            return;
        this.showInfiniteSpinner = true;
        this.skip += 6;
        this.getMoreFeatured(this.league);
    }
};
FeaturedComponent = __decorate([
    Component({
        selector: 'app-featured',
        templateUrl: './featured.component.html',
        styleUrls: ['./featured.component.scss'],
    })
], FeaturedComponent);
export { FeaturedComponent };
//# sourceMappingURL=featured.component.js.map