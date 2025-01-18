import { __decorate } from "tslib";
import { NgModule } from '@angular/core';
import { TermsComponent } from './terms/terms.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { GuidelinesComponent } from './guidelines/guidelines.component';
import { RulesComponent } from './rules/rules.component';
import { LegalRoutingModule } from './legal-routing.module';
let LegalModule = class LegalModule {
};
LegalModule = __decorate([
    NgModule({
        declarations: [TermsComponent, PrivacyComponent, GuidelinesComponent, RulesComponent],
        imports: [
            LegalRoutingModule
        ]
    })
], LegalModule);
export { LegalModule };
//# sourceMappingURL=legal.module.js.map