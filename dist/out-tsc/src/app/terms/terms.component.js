import { __decorate } from "tslib";
import { Component } from '@angular/core';
let TermsComponent = class TermsComponent {
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
TermsComponent = __decorate([
    Component({
        selector: 'app-terms',
        templateUrl: './terms.component.html',
        styleUrls: ['./terms.component.scss']
    })
], TermsComponent);
export { TermsComponent };
//# sourceMappingURL=terms.component.js.map