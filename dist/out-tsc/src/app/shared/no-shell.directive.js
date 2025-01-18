import { __decorate, __param } from "tslib";
import { Directive, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
let AppShellNoRenderDirective = class AppShellNoRenderDirective {
    constructor(viewContainer, templateRef, platformId) {
        this.viewContainer = viewContainer;
        this.templateRef = templateRef;
        this.platformId = platformId;
    }
    ngOnInit() {
        if (isPlatformServer(this.platformId)) {
            this.viewContainer.clear();
        }
        else {
            this.viewContainer.createEmbeddedView(this.templateRef);
        }
    }
};
AppShellNoRenderDirective = __decorate([
    Directive({
        selector: '[appShellNoRender]'
    }),
    __param(2, Inject(PLATFORM_ID))
], AppShellNoRenderDirective);
export { AppShellNoRenderDirective };
//# sourceMappingURL=no-shell.directive.js.map