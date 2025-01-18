import { __decorate } from "tslib";
import { Component } from '@angular/core';
let PrivacyComponent = class PrivacyComponent {
    constructor(authService) {
        this.authService = authService;
    }
    ngOnInit() {
        this.authService.toggleAccess = false;
        this.authService.register = false;
        this.authService.chooseLeagues = false;
        this.authService.teams = false;
    }
};
PrivacyComponent = __decorate([
    Component({
        selector: 'app-privacy',
        templateUrl: './privacy.component.html',
        styleUrls: ['./privacy.component.scss']
    })
], PrivacyComponent);
export { PrivacyComponent };
//# sourceMappingURL=privacy.component.js.map