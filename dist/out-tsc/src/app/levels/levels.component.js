import { __decorate, __param } from "tslib";
import { Component, Inject } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
let LevelsComponent = class LevelsComponent {
    constructor(renderer, authService, platformId) {
        this.renderer = renderer;
        this.authService = authService;
        this.platformId = platformId;
    }
    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.renderer.addClass(document.body, 'modal-open');
        }
    }
    ngOnDestroy() {
        if (isPlatformBrowser(this.platformId)) {
            this.renderer.removeClass(document.body, 'modal-open');
        }
    }
    goBack() {
        this.authService.levelsInfo = false;
    }
};
LevelsComponent = __decorate([
    Component({
        selector: 'app-levels',
        templateUrl: './levels.component.html',
        styleUrls: ['./levels.component.scss']
    }),
    __param(2, Inject(PLATFORM_ID))
], LevelsComponent);
export { LevelsComponent };
//# sourceMappingURL=levels.component.js.map