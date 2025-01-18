import { __decorate, __param } from "tslib";
import { Component, Inject } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
/**
 * Generated class for the FollowersPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
let FollowersComponent = class FollowersComponent {
    constructor(renderer, platformId, authService, el) {
        this.renderer = renderer;
        this.platformId = platformId;
        this.authService = authService;
        this.el = el;
        this.title = "";
        this.skipFollowing = 0;
        this.skipFollowers = 0;
        this.users = [];
        this.wait = true;
        this.enableInfinite = false;
        let data = this.authService.paramSignUp;
        this.title = data.title;
        this.fetchUser = data.userId;
    }
    ngOnInit() {
        if (this.title.toLocaleLowerCase() == "followers") {
            setTimeout(() => {
                this.getFollowers();
            }, 500);
        }
        else {
            setTimeout(() => {
                this.getFollowing();
            }, 500);
        }
        if (isPlatformBrowser(this.platformId)) {
            this.renderer.addClass(document.body, 'modal-open');
        }
    }
    ngOnDestroy() {
        this.renderer.removeClass(document.body, 'modal-open');
    }
    goBack() {
        this.authService.followInfo = false;
    }
    showVisible(e) {
        if (isPlatformBrowser(this.platformId)) {
            for (let img of this.el.nativeElement.querySelectorAll('.profile-pic')) {
                let realSrc = img.dataset.src;
                if (!realSrc)
                    continue;
                if (this.isVisible(img)) {
                    if (e != null) {
                        e.domWrite(() => {
                            img.src = realSrc;
                            img.dataset.src = '';
                        });
                    }
                    else {
                        img.src = realSrc;
                        img.dataset.src = '';
                    }
                }
            }
        }
    }
    isVisible(elem) {
        if (isPlatformBrowser(this.platformId)) {
            let coords = elem.getBoundingClientRect();
            let windowHeight = document.documentElement.clientHeight;
            // top elem edge is visible OR bottom elem edge is visible
            let topVisible = coords.top > 0 && coords.top < windowHeight;
            let bottomVisible = coords.bottom < windowHeight && coords.bottom > 0;
            return topVisible || bottomVisible;
        }
    }
    getFollowers() {
        this.authService.getFollowers(0, this.fetchUser)
            .subscribe((data) => {
            let followers = data.followers.filter(element => element._id != this.authService.currentUser._id);
            this.wait = false;
            this.users = followers;
            if (data.followers.length < 20)
                this.enableInfinite = false;
            else {
                this.enableInfinite = true;
            }
            setTimeout(() => {
                this.showVisible(null);
            }, 0);
        }, (err) => {
            this.wait = false;
            this.authService.errorMessage = err;
            setTimeout(() => {
                this.authService.errorMessage = null;
            }, 5000);
        });
    }
    getMoreFollowers() {
        this.authService.getFollowers(this.skipFollowers, this.fetchUser)
            .subscribe((data) => {
            let followers = data.followers.filter(element => element._id != this.authService.currentUser._id);
            ;
            this.wait = false;
            let newTimelinesArray = this.users.concat(followers);
            //Eliminar duplicados. Esto sucede porque continuamente se agregan discusiones a la base de datos; el skip genera esto.
            var unique = newTimelinesArray.filter((item, i, array) => {
                return array.findIndex((item2) => { return item2._id == item._id; }) === i;
            });
            this.users = unique;
            if (data.followers.length < 20)
                this.enableInfinite = false;
            setTimeout(() => {
                this.showVisible(null);
            }, 0);
        }, (err) => {
            this.wait = false;
            this.authService.errorMessage = err;
            setTimeout(() => {
                this.authService.errorMessage = null;
            }, 5000);
        });
    }
    getFollowing() {
        this.authService.getFollowing(0, this.fetchUser)
            .subscribe((data) => {
            this.users = data.following.filter(element => element._id != this.authService.currentUser._id);
            this.wait = false;
            if (data.following.length < 20)
                this.enableInfinite = false;
            else {
                this.enableInfinite = true;
            }
            setTimeout(() => {
                this.showVisible(null);
            }, 0);
        }, (err) => {
            this.wait = false;
            this.authService.errorMessage = err;
            setTimeout(() => {
                this.authService.errorMessage = null;
            }, 5000);
        });
    }
    getMoreFollowing() {
        this.authService.getFollowing(this.skipFollowing, this.fetchUser)
            .subscribe((data) => {
            let following = data.following.filter(element => element._id != this.authService.currentUser._id);
            this.wait = false;
            let newTimelinesArray = this.users.concat(following);
            //Eliminar duplicados. Esto sucede porque continuamente se agregan discusiones a la base de datos; el skip genera esto.
            var unique = newTimelinesArray.filter((item, i, array) => {
                return array.findIndex((item2) => { return item2._id == item._id; }) === i;
            });
            this.users = unique;
            if (data.following.length < 20)
                this.enableInfinite = false;
            setTimeout(() => {
                this.showVisible(null);
            }, 0);
        }, (err) => {
            this.wait = false;
            this.authService.errorMessage = err;
            setTimeout(() => {
                this.authService.errorMessage = null;
            }, 5000);
        });
    }
    doInfinite(infiniteScroll) {
        if (this.title.toLocaleLowerCase() == "following") {
            this.skipFollowing += 20;
            this.getMoreFollowing();
        }
        else {
            this.skipFollowers += 20;
            this.getMoreFollowers();
        }
    }
};
FollowersComponent = __decorate([
    Component({
        selector: 'app-followers',
        templateUrl: './followers.component.html',
        styleUrls: ['./followers.component.scss']
    }),
    __param(1, Inject(PLATFORM_ID))
], FollowersComponent);
export { FollowersComponent };
//# sourceMappingURL=followers.component.js.map