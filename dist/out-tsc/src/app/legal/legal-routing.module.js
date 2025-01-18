import { __decorate } from "tslib";
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PrivacyComponent } from './privacy/privacy.component';
import { GuidelinesComponent } from './guidelines/guidelines.component';
import { RulesComponent } from './rules/rules.component';
import { TermsComponent } from './terms/terms.component';
const routes = [
    { path: 'privacy-policy', component: PrivacyComponent },
    { path: 'guidelines', component: GuidelinesComponent },
    { path: 'rules', component: RulesComponent },
    { path: 'terms-of-use', component: TermsComponent },
];
let LegalRoutingModule = class LegalRoutingModule {
};
LegalRoutingModule = __decorate([
    NgModule({
        imports: [RouterModule.forChild(routes)],
        exports: [RouterModule]
    })
], LegalRoutingModule);
export { LegalRoutingModule };
//# sourceMappingURL=legal-routing.module.js.map