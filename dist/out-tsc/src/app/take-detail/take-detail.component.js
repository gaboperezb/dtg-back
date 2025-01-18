import { __decorate, __param } from "tslib";
import { Component, ViewChild, HostListener, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { InViewportMetadata } from 'ng-in-viewport';
let TakeDetailComponent = class TakeDetailComponent {
    constructor(route, el, location, platformId, threadDiscussionService, authService, stateService, takeDiscussionService, takeService, router, seoSocialShareService, webSocketService, takeLikesService, threadsService, likesService) {
        this.route = route;
        this.el = el;
        this.location = location;
        this.platformId = platformId;
        this.threadDiscussionService = threadDiscussionService;
        this.authService = authService;
        this.stateService = stateService;
        this.takeDiscussionService = takeDiscussionService;
        this.takeService = takeService;
        this.router = router;
        this.seoSocialShareService = seoSocialShareService;
        this.webSocketService = webSocketService;
        this.takeLikesService = takeLikesService;
        this.threadsService = threadsService;
        this.likesService = likesService;
        this.sticky = false;
        this.sendingComment = false;
        this.comment = "";
        this.textareaFocused = false;
        this.toggleSort = false;
        this.showTimer = false;
        this.largeLink = false;
        this.loadingTake = false;
        this.enableInfinite = false;
        this.skipHot = 0;
        this.skipNew = 0;
        this.skipTop = 0;
        this.loadingDiscussions = true;
        this.loadingInitial = true;
        this.timelines = [];
        this.admin = false;
        this.videoPaused = true;
        this.dontPlay = false;
        this.notLoaded = true;
        this.videoLoaded = false;
        this.hot = true;
        this.new = false;
        this.sortBy = "HOT";
        this.top = false;
        this.viewEntered = false;
        this.showInfiniteSpinner = false;
    }
    ngOnDestroy() {
        if (this.take && this.take.video)
            this.unloadVideo();
    }
    commentFocused() {
        this.textareaFocused = true;
    }
    goBack() {
        if (this.takeService.takes.length || this.threadsService.threads.length)
            this.location.back();
        else {
            this.router.navigate(['../']);
        }
    }
    commentUnfocused() {
        this.textareaFocused = false;
    }
    checkSticky() {
        if (window.pageYOffset > this.offsetTopBack) {
            if (!this.sticky)
                this.sticky = true;
        }
        else {
            if (this.sticky)
                this.sticky = false;
        }
    }
    // When the user scrolls the page, execute myFunction
    onWindowScroll() {
        this.checkSticky();
    }
    ngAfterViewInit() {
        this.offsetTopBack = this.backElement.nativeElement.offsetTop - 55;
    }
    goToUser() {
        this.router.navigate(['/u', this.take.user.username]);
    }
    loadVideo() {
        this.videoTake.nativeElement.pause();
        this.videoTake.nativeElement.src = this.take.video; // empty source
        this.videoTake.nativeElement.load();
        this.videoLoaded = true;
    }
    unloadVideo() {
        this.videoTake.nativeElement.pause();
        this.videoTake.nativeElement.src = ""; // empty source
        this.videoTake.nativeElement.load();
        this.videoLoaded = false;
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
                this.configureTake(data.data.take);
                if (isPlatformBrowser(this.platformId)) {
                    this.getDiscussions();
                }
                if (this.take.video) {
                    this.setVideoContainerStyle();
                }
                else if (this.take.picture) {
                    this.setPictureContainerStyle();
                }
                if (this.authService.isLoggedIn()) {
                    if (this.authService.currentUser.isAdmin)
                        this.admin = true;
                }
            }
        });
    }
    configureSEO() {
        let picture;
        let data;
        if (this.take.picture) {
            picture = this.take.picture;
            data = {
                title: this.take.take,
                description: this.take.league + 'discussion by u/' + this.take.user.username,
                site: 'http://localhost:3000/discussions/' + this.take._id,
                image: picture,
                large: true
            };
        }
        else {
            data = {
                title: this.take.take,
                description: this.take.league + 'discussion by u/' + this.take.user.username,
                site: 'http://localhost:3000/discussions/' + this.take._id,
                image: "https://discussthegame.s3-us-west-1.amazonaws.com/ui/dtg-share.png",
                large: false
            };
        }
        this.seoSocialShareService.setData(data);
    }
    configureTake(take) {
        take.date = new Date(take.date);
        take.created = this.created(take);
        take.likedByUser = this.userHasLiked(take);
        take.count = take.likers ? take.likers.length : 0;
        this.take = take;
        this.configureSEO();
        if (this.take.type == 'Link') {
            if (this.take.thumbnail_width > 500 && this.take.provider_name != 'Twitter' && this.take.urlType != 'video') {
                this.cutURLText(80);
            }
            else {
                this.cutURLText(60);
            }
        }
    }
    onIntersection($event) {
        const { [InViewportMetadata]: { entry }, target } = $event;
        const ratio = entry.intersectionRatio;
        const vid = target;
        if (ratio >= 0.02) {
            this.dontPlay = false;
            if (this.take.videoCurrentTime)
                vid.currentTime = this.take.videoCurrentTime;
            if (!this.videoLoaded)
                this.loadVideo();
        }
        else {
            this.dontPlay = true; //a veces no se pone pausa por el hack cuando te sales de fullscreen para que se vuelva a reproducir
            vid.currentTime = 0;
            if (this.videoLoaded)
                this.unloadVideo();
        }
    }
    sortDiscussions(sortBy) {
        this.loadingDiscussions = true;
        if (sortBy == 'HOT') {
            this.sortBy = "HOT";
            this.hot = true;
            this.new = false;
            this.top = false;
            this.toggleSort = false;
            this.getDiscussions();
        }
        else if (sortBy == 'NEW') {
            this.sortBy = "NEW";
            this.hot = false;
            this.top = false;
            this.new = true;
            this.toggleSort = false;
            this.getNewestDiscussions();
        }
        else {
            this.sortBy = "TOP";
            this.hot = false;
            this.top = true;
            this.new = false;
            this.toggleSort = false;
            this.getTopDiscussions();
        }
    }
    syncVideoTime(vid) {
        if (this.take.videoCurrentTime)
            vid.currentTime = this.take.videoCurrentTime;
    }
    deleteComment(comment) {
        this.timelines = this.timelines.filter(timeline => timeline._id.toString() != comment.toString());
    }
    goAccess(type) {
        this.authService.toggleAccess = true;
        this.authService.register = true;
        if (type == 'login')
            this.authService.toggleLogin = true;
        else {
            this.authService.toggleLogin = false;
        }
    }
    getDiscussions() {
        this.enableInfinite = false;
        this.skipHot = 0;
        this.takeDiscussionService.getDiscussions(this.take._id, 0)
            .subscribe((timelines) => {
            timelines.forEach((timeline) => {
                timeline.date = new Date(timeline.date);
                timeline.created = this.created(timeline);
                timeline.likedByUser = this.userHasLiked(timeline);
            });
            this.timelines = timelines;
            this.loadingInitial = false;
            this.loadingDiscussions = false;
            if (this.timelines.length >= 25)
                this.enableInfinite = true;
            else {
                this.enableInfinite = false;
            }
        }, (err) => {
            this.enableInfinite = true;
            this.loadingDiscussions = false;
            this.loadingInitial = false;
            this.authService.errorMessage = err;
            setTimeout(() => {
                this.authService.errorMessage = null;
            }, 5000);
        });
    }
    getNewestDiscussions() {
        this.enableInfinite = false;
        this.skipNew = 0;
        if (this.reactivateInfinite)
            this.enableInfinite = true;
        this.takeDiscussionService.getNewestDiscussions(this.take._id, 0)
            .subscribe((timelines) => {
            timelines.forEach((timeline) => {
                timeline.date = new Date(timeline.date);
                timeline.created = this.created(timeline);
                timeline.likedByUser = this.userHasLiked(timeline);
            });
            this.timelines = timelines;
            this.loadingDiscussions = false;
            this.loadingInitial = false;
            if (this.timelines.length >= 25)
                this.enableInfinite = true;
            else {
                this.enableInfinite = false;
            }
        }, (err) => {
            this.loadingDiscussions = false;
            this.loadingInitial = false;
            this.enableInfinite = true;
            this.authService.errorMessage = err;
            setTimeout(() => {
                this.authService.errorMessage = null;
            }, 5000);
        });
    }
    getTopDiscussions() {
        this.enableInfinite = false;
        this.skipTop = 0;
        if (this.reactivateInfinite)
            this.enableInfinite = true;
        this.takeDiscussionService.getTopDiscussions(this.take._id, 0)
            .subscribe((timelines) => {
            timelines.forEach((timeline) => {
                timeline.date = new Date(timeline.date);
                timeline.created = this.created(timeline);
                timeline.likedByUser = this.userHasLiked(timeline);
            });
            this.loadingDiscussions = false;
            this.loadingInitial = false;
            this.timelines = timelines;
            if (this.timelines.length >= 25)
                this.enableInfinite = true;
            else {
                this.enableInfinite = false;
            }
        }, (err) => {
            this.enableInfinite = true;
            this.loadingDiscussions = false;
            this.loadingInitial = false;
            this.authService.errorMessage = err;
            setTimeout(() => {
                this.authService.errorMessage = null;
            }, 5000);
        });
    }
    cutURLText(limit) {
        if (this.take.urlTitle) {
            let reducedText = this.take.urlTitle.substring(0, limit);
            if (reducedText.length < this.take.urlTitle.length) {
                this.take.reducedTitle = this.take.urlTitle.substring(0, limit) + "...";
            }
            else {
                this.take.reducedTitle = this.take.urlTitle;
            }
        }
    }
    changeVideoAudio(id, e) {
        e.stopPropagation();
        let vid = document.getElementById('media-' + id);
        if (vid.muted) {
            e.preventDefault();
        }
        this.fullVideo(vid);
    }
    fullVideo(vid) {
        vid.muted = false;
        this.videoPaused = false;
        this.notLoaded = false;
    }
    fullSizePicture(e) {
        e.stopPropagation();
        this.takeService.fullScreen = true;
        this.takeService.fullScreenImage = this.take.picture;
        this.stateService.freezeBody();
    }
    openLink(e) {
        e.stopPropagation();
        window.open(this.take.url, "_blank");
    }
    isVisible(elem) {
        if (elem) {
            let coords = elem.getBoundingClientRect();
            let windowHeight = document.documentElement.clientHeight;
            // top elem edge is visible OR bottom elem edge is visible
            let topVisible = coords.top > 0 && coords.top < windowHeight;
            let bottomVisible = coords.bottom < windowHeight && coords.bottom > 0;
            return topVisible || bottomVisible;
        }
    }
    onPause($event) {
        clearInterval(this.timeInterval);
        let vid = $event.target;
        this.videoPaused = true;
        this.videoTime(vid);
        clearInterval(this.displayTimeTimeout);
        this.displayTimeTimeout = setTimeout(() => {
            this.showTimer = false;
        }, 6000);
    }
    onPlay($event) {
        let vid = $event.target;
        this.videoPaused = false;
        clearTimeout(this.displayTimeTimeout);
        this.showTimer = true;
        this.displayTimeTimeout = setTimeout(() => {
            this.showTimer = false;
        }, 6000);
    }
    videoTime(vid) {
        if (vid.duration)
            this.time = this.sec2time(Math.round(vid.duration - vid.currentTime));
        this.timeInterval = setInterval(() => {
            if (vid.duration)
                this.time = this.sec2time(Math.round(vid.duration - vid.currentTime));
        }, 1000);
    }
    pad(num, size) {
        return ('000' + num).slice(size * -1);
    }
    sec2time(timeInSeconds) {
        let time = parseFloat(timeInSeconds).toFixed(3);
        let hours = Math.floor(Number(time) / 60 / 60), minutes = Math.floor(Number(time) / 60) % 60, seconds = Math.floor(Number(time) - minutes * 60), milliseconds = time.slice(-3);
        return this.pad(minutes, 2).charAt(1) + ':' + this.pad(seconds, 2);
    }
    playIconClicked(id, e) {
        e.stopPropagation();
        console.log('as');
        let vid = document.getElementById('media-' + id);
        vid.play();
        if (vid.muted) {
            e.preventDefault();
        }
        this.fullVideo(vid);
    }
    onMetadata($event) {
        let vid = $event.target;
        this.syncVideoTime(vid);
        this.videoTime(vid);
        this.showTimer = true;
        this.displayTimeTimeout = setTimeout(() => {
            this.showTimer = false;
        }, 4000);
    }
    like(e) {
        e.stopPropagation();
        if (this.authService.isLoggedIn()) {
            if (this.userHasLiked(this.take)) {
                this.take.likedByUser = false;
                this.take.count -= 1;
                if (this.takeService.currentTake)
                    this.takeService.currentTake.count -= 1;
                if (this.takeService.currentTake)
                    this.takeService.currentTake.likedByUser = false;
                this.takeLikesService.deleteTakeLike(this.take, this.authService.currentUser._id);
            }
            else {
                this.take.likedByUser = true;
                this.take.count += 1;
                if (this.takeService.currentTake)
                    this.takeService.currentTake.count += 1;
                if (this.takeService.currentTake)
                    this.takeService.currentTake.likedByUser = true;
                this.takeLikesService.postTakeLike(this.take, this.authService.currentUser._id);
            }
        }
        else {
            //Mandar a signup
            this.authService.toggleAccess = true;
            this.authService.register = true;
            this.authService.toggleLogin = false;
        }
    }
    userHasLiked(thread) {
        if (this.authService.currentUser) {
            return this.takeLikesService.userHasLiked(thread, this.authService.currentUser._id);
        }
        else {
            return false;
        }
    }
    sendComment() {
        if (this.comment.length == 0)
            return;
        if (this.authService.isLoggedIn()) {
            this.sendingComment = true;
            let data = {
                opinion: this.comment,
                takeUser: this.take.user._id,
                playerIds: this.take.user.playerIds
            };
            this.takeDiscussionService.postDiscussion(data, this.take._id)
                .subscribe((timeline) => {
                this.webSocketService.emitPost(this.take._id, "take", this.take.user._id, this.authService.currentUser._id);
                timeline.date = new Date(timeline.date);
                timeline.count = 0;
                timeline.created = "1min";
                this.timelines.unshift(timeline);
                this.sendingComment = false;
                this.comment = "";
                this.take.replies += 1;
            }, (err) => {
                this.sendingComment = false;
                this.authService.errorMessage = err;
                setTimeout(() => {
                    this.authService.errorMessage = null;
                }, 5000);
            });
        }
    }
    created(take) {
        let milliseconds = take.date.getTime();
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
    getMoreNewestDiscussions(skip) {
        this.loadingDiscussions = true;
        this.takeDiscussionService.getNewestDiscussions(this.take._id, skip)
            .subscribe((timelines) => {
            timelines.forEach((timeline) => {
                timeline.date = new Date(timeline.date);
                timeline.created = this.created(timeline);
                timeline.likedByUser = this.userHasLiked(timeline);
            });
            let newTimelinesArray = this.timelines.concat(timelines);
            //Eliminar duplicados. Esto sucede porque continuamente se agregan discusiones a la base de datos; el skip genera esto.
            var unique = newTimelinesArray.filter((item, i, array) => {
                return array.findIndex((item2) => { return item2._id == item._id; }) === i;
            });
            this.loadingDiscussions = false;
            if (timelines.length < 25)
                this.enableInfinite = false;
            this.timelines = unique;
            this.showInfiniteSpinner = false;
        }, (err) => {
            this.showInfiniteSpinner = false;
            this.loadingDiscussions = false;
            this.authService.errorMessage = err;
            setTimeout(() => {
                this.authService.errorMessage = null;
            }, 5000);
        });
    }
    getMoreTopDiscussions(skip) {
        this.loadingDiscussions = true;
        this.threadDiscussionService.getTopDiscussions(this.take._id, skip)
            .subscribe((timelines) => {
            timelines.forEach((timeline) => {
                timeline.date = new Date(timeline.date);
                timeline.created = this.created(timeline);
                timeline.likedByUser = this.userHasLiked(timeline);
            });
            let newTimelinesArray = this.timelines.concat(timelines);
            //Eliminar duplicados. Esto sucede porque continuamente se agregan discusiones a la base de datos; el skip genera esto.
            var unique = newTimelinesArray.filter((item, i, array) => {
                return array.findIndex((item2) => { return item2._id == item._id; }) === i;
            });
            this.timelines = unique;
            this.loadingDiscussions = false;
            if (timelines.length < 25)
                this.enableInfinite = false;
            this.showInfiniteSpinner = false;
        }, (err) => {
            this.loadingDiscussions = false;
            this.authService.errorMessage = err;
            setTimeout(() => {
                this.authService.errorMessage = null;
            }, 5000);
            this.showInfiniteSpinner = false;
        });
    }
    getMoreDiscussions(skip) {
        this.loadingDiscussions = true;
        this.threadDiscussionService.getDiscussions(this.take._id, skip)
            .subscribe((timelines) => {
            timelines.forEach((timeline) => {
                timeline.date = new Date(timeline.date);
                timeline.created = this.created(timeline);
                timeline.likedByUser = this.userHasLiked(timeline);
            });
            let newTimelinesArray = this.timelines.concat(timelines);
            //Eliminar duplicados. Esto sucede porque continuamente se agregan discusiones a la base de datos; el skip genera esto.
            var unique = newTimelinesArray.filter((item, i, array) => {
                return array.findIndex((item2) => { return item2._id == item._id; }) === i;
            });
            this.timelines = unique;
            this.loadingDiscussions = false;
            if (timelines.length < 25)
                this.enableInfinite = false;
            this.showInfiniteSpinner = false;
        }, (err) => {
            this.loadingDiscussions = false;
            this.authService.errorMessage = err;
            setTimeout(() => {
                this.authService.errorMessage = null;
            }, 5000);
            this.showInfiniteSpinner = false;
        });
    }
    setVideoContainerStyle() {
        this.videoStyle = {
            'border-radius': '10px',
            'position': 'relative',
            'padding-top': ((this.take.videoHeight / this.take.videoWidth) * 100) + "%"
        };
    }
    setPictureContainerStyle() {
        this.pictureStyle = {
            'position': 'relative',
            'background': '#ededed',
            'border': '1px solid #ededed',
            'border-radius': '10px',
            'padding-top': ((this.take.pictureHeight / this.take.pictureWidth) * 100) + "%"
        };
    }
    doInfinite() {
        if (this.showInfiniteSpinner)
            return;
        this.showInfiniteSpinner = true;
        if (this.hot) {
            this.skipHot += 25;
            this.getMoreDiscussions(this.skipHot);
        }
        else if (this.new) {
            this.skipNew += 25;
            this.getMoreNewestDiscussions(this.skipNew);
        }
        else {
            this.skipTop += 25;
            this.getMoreTopDiscussions(this.skipTop);
        }
    }
};
__decorate([
    ViewChild('videoTake')
], TakeDetailComponent.prototype, "videoTake", void 0);
__decorate([
    ViewChild('back')
], TakeDetailComponent.prototype, "backElement", void 0);
__decorate([
    HostListener("window:scroll", [])
], TakeDetailComponent.prototype, "onWindowScroll", null);
TakeDetailComponent = __decorate([
    Component({
        selector: 'app-take-detail',
        templateUrl: './take-detail.component.html',
        styleUrls: ['./take-detail.component.scss'],
    }),
    __param(3, Inject(PLATFORM_ID))
], TakeDetailComponent);
export { TakeDetailComponent };
//# sourceMappingURL=take-detail.component.js.map