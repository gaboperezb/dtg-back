import { __decorate, __param } from "tslib";
import { Component, Inject } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
let HomeComponent = class HomeComponent {
    constructor(platformId, router) {
        this.platformId = platformId;
        this.router = router;
    }
    ngOnInit() {
    }
    appstore() {
        if (isPlatformBrowser(this.platformId)) {
            window.location.href = 'https://itunes.apple.com/us/app/discuss-thegame/id1411535287';
        }
    }
    googleplay() {
        if (isPlatformBrowser(this.platformId)) {
            window.location.href = 'https://play.google.com/store/apps/details?id=com.discussthegame';
        }
    }
    editor() {
        this.router.navigateByUrl('/create');
    }
};
HomeComponent = __decorate([
    Component({
        selector: 'app-home',
        templateUrl: './home.component.html',
        styleUrls: ['./home.component.scss']
    }),
    __param(0, Inject(PLATFORM_ID))
], HomeComponent);
export { HomeComponent };
//# sourceMappingURL=home.component.js.map