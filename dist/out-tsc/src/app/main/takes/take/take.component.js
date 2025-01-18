import { __decorate } from "tslib";
import { Component, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { InViewportMetadata } from 'ng-in-viewport';
;
let TakeComponent = class TakeComponent {
    constructor(authService, el, router, stateService, takeLikesService, threadsService, takeService) {
        this.authService = authService;
        this.el = el;
        this.router = router;
        this.stateService = stateService;
        this.takeLikesService = takeLikesService;
        this.threadsService = threadsService;
        this.takeService = takeService;
        this.deleteTakeEmitter = new EventEmitter();
        this.toggleEdit = false;
        this.showTimer = false;
        this.videoPaused = true;
        this.dontPlay = false;
        this.largeLink = false;
        this.smallLink = false;
        this.reducedTitle = "";
        this.hideVideo = false;
        this.notLoaded = true;
        this.videoLoaded = false;
    }
    ngOnDestroy() {
        if (this.take.video)
            this.unloadVideo();
    }
    ngOnInit() {
        if (this.take.video) {
            this.setVideoContainerStyle();
        }
        if (this.take.picture) {
            this.setPictureContainerStyle();
        }
        if (this.take.type == 'Link') {
            this.resizeURLImage();
        }
    }
    toggleMoreOptions(e) {
        e.stopPropagation();
        this.toggleEdit = !this.toggleEdit;
    }
    editTake(e) {
        this.toggleEdit = false;
        e.stopPropagation();
        this.takeService.takeToEdit = this.take;
        this.takeService.takeToEditOriginal = this.take;
        this.router.navigateByUrl('/create-discussion');
        //editar
    }
    deleteTake(e) {
        this.toggleEdit = false;
        e.stopPropagation();
        var r = confirm("Do you want to delete this discussion?");
        if (r) {
            let data = {
                takeId: this.take._id,
                userId: this.authService.currentUser._id
            };
            this.deleteTakeEmitter.emit(this.take._id);
            this.takeService.deleteTake(data)
                .subscribe((success) => {
                if (success) {
                }
                else {
                    this.authService.errorMessage = 'Could not delete discussion. Please try again later';
                    setTimeout(() => {
                        this.authService.errorMessage = null;
                    }, 3000);
                }
            }, (err) => {
                this.authService.errorMessage = 'Could not delete discussion. Please try again later';
                setTimeout(() => {
                    this.authService.errorMessage = null;
                }, 3000);
            });
        }
        else {
        }
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
    setPictureContainerStyle() {
        this.pictureStyle = {
            'position': 'relative',
            'background': '#ededed',
            'border': '1px solid #dcdcdc',
            'border-radius': '10px',
            'padding-top': ((this.take.pictureHeight / this.take.pictureWidth) * 100) + "%"
        };
    }
    resizeURLImage() {
        if (this.take.thumbnail_width > 500 && this.take.provider_name != 'Twitter' && this.take.urlType != 'video') {
            this.cutURLText(150);
            this.largeLink = true;
        }
        else {
            this.cutURLText(150);
            this.smallLink = true;
        }
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
    onMetadata($event) {
        let vid = $event.target;
        this.videoTime(vid);
        this.showTimer = true;
        this.displayTimeTimeout = setTimeout(() => {
            this.showTimer = false;
        }, 6000);
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
    unloadVideo() {
        this.videoTake.nativeElement.pause();
        this.videoTake.nativeElement.src = ""; // empty source
        this.videoTake.nativeElement.load();
        this.videoLoaded = false;
        this.videoPaused = true;
        this.videoTake.nativeElement.muted = true;
    }
    loadVideo() {
        this.videoTake.nativeElement.pause();
        this.videoTake.nativeElement.src = this.take.video; // empty source
        this.videoTake.nativeElement.load();
        this.videoTake.nativeElement.play();
        this.videoLoaded = true;
    }
    openLink(e) {
        e.stopPropagation();
        window.open(this.take.url, "_blank");
    }
    onData(e) {
        this.notLoaded = false;
        let vid = e.target;
        if (this.take.videoCurrentTime)
            vid.currentTime = this.take.videoCurrentTime;
        this.take.videoCurrentTime = null;
    }
    videoTime(vid) {
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
    itemTapped() {
        if (this.take.video) {
            let vid = document.getElementById('media-' + this.take._id);
            this.take.videoCurrentTime = vid.currentTime;
        }
        this.takeService.currentTake = this.take;
        this.router.navigate(['/discussions', this.take._id]);
    }
    like(e) {
        e.stopPropagation();
        if (this.authService.isLoggedIn()) {
            if (this.userHasLiked(this.take)) {
                this.take.likedByUser = false;
                this.take.count -= 1;
                this.takeLikesService.deleteTakeLike(this.take, this.authService.currentUser._id);
            }
            else {
                this.take.likedByUser = true;
                this.take.count += 1;
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
    goToUser(event) {
        event.stopPropagation();
        this.router.navigate(['/u', this.take.user.username]);
    }
    /* goToUser(event) {

        let user = this.take.user;

        event.stopPropagation()
        if (this.authService.isLoggedIn()) {
            if (this.authService.currentUser.username == user.username) {
                this.authService.downloadProfile = true;
                let data = {
                    fromTabs: false,
                    loadInitial: true
                }
                this.authService.paramSignUp = data;
                this.navCtrl.navigateForward(this.router.url.substr(0, 10) + '/profile');

            } else {
                let data = {
                    user: user
                }
                this.authService.paramSignUp = data;
                this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/user', user._id]);

            }

        } else {
            let data = {
                user: user
            }
            this.authService.paramSignUp = data;
            this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/user', user._id])

        }

    } */
    setVideoContainerStyle() {
        this.videoStyle = {
            'border-radius': '10px',
            'position': 'relative',
            'padding-top': ((this.take.videoHeight / this.take.videoWidth) * 100) + "%"
        };
    }
    setiframeStyle() {
        let percentage = (this.takeService.width / this.take.htmlWidth);
        this.iframeStyle = {
            'height': this.take.htmlHeight * percentage > this.take.htmlHeight ? this.take.htmlHeight + 'px' : this.take.htmlHeight * percentage + 'px',
            'width': this.takeService.width + 'px',
            'margin': '16px 0'
        };
    }
    changeVideoAudio(id, e) {
        e.stopPropagation();
        let vid = document.getElementById('media-' + id);
        if (vid.muted) {
            e.preventDefault();
        }
        this.fullVideo(vid);
    }
    playIconClicked(id, e) {
        e.stopPropagation();
        let vid = document.getElementById('media-' + id);
        vid.play();
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
    dataon() {
    }
    onIntersection($event) {
        console.log('hola');
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
    setLinkStyle() {
        this.linkStyle = {
            'background-image': 'url(' + this.take.thumbnail_url + ')',
            'background-size': 'cover',
            'height': '75px',
            'width': '95px',
            'margin-left': '10px',
            'background-position': 'center',
            'border-radius': '5px',
            'float': 'right',
            'position': 'relative',
            'overflow': 'hidden'
        };
    }
};
__decorate([
    ViewChild('videoTake')
], TakeComponent.prototype, "videoTake", void 0);
__decorate([
    Input()
], TakeComponent.prototype, "take", void 0);
__decorate([
    Input()
], TakeComponent.prototype, "i", void 0);
__decorate([
    Output()
], TakeComponent.prototype, "deleteTakeEmitter", void 0);
TakeComponent = __decorate([
    Component({
        selector: 'app-take',
        templateUrl: './take.component.html',
        styleUrls: ['./take.component.scss'],
    })
], TakeComponent);
export { TakeComponent };
//# sourceMappingURL=take.component.js.map