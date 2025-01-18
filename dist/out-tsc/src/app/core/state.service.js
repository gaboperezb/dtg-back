import { __decorate, __param } from "tslib";
import { Injectable, Inject } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
let StateService = class StateService {
    constructor(rendererFactory, platformId) {
        this.rendererFactory = rendererFactory;
        this.platformId = platformId;
        this.renderer = rendererFactory.createRenderer(null, null);
    }
    freezeBody() {
        if (isPlatformBrowser(this.platformId)) {
            this.renderer.addClass(document.body, 'modal-open');
        }
    }
    unfreezeBody() {
        if (isPlatformBrowser(this.platformId)) {
            this.renderer.removeClass(document.body, 'modal-open');
        }
    }
};
StateService = __decorate([
    Injectable({
        providedIn: 'root'
    }),
    __param(1, Inject(PLATFORM_ID))
], StateService);
export { StateService };
//# sourceMappingURL=state.service.js.map