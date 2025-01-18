import { __decorate, __param } from "tslib";
import { Directive, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
let AppShellRenderDirective = class AppShellRenderDirective {
    constructor(viewContainer, templateRef, platformId) {
        this.viewContainer = viewContainer;
        this.templateRef = templateRef;
        this.platformId = platformId;
    }
    ngOnInit() {
        if (isPlatformServer(this.platformId)) {
            this.viewContainer.createEmbeddedView(this.templateRef);
        }
        else {
            this.viewContainer.clear();
        }
    }
};
AppShellRenderDirective = __decorate([
    Directive({
        selector: '[appShellRender]'
    }),
    __param(2, Inject(PLATFORM_ID))
], AppShellRenderDirective);
export { AppShellRenderDirective };
//# sourceMappingURL=shell.directive.js.map