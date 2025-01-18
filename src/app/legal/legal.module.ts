import { NgModule } from '@angular/core';
import { TermsComponent } from './terms/terms.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { GuidelinesComponent } from './guidelines/guidelines.component';
import { RulesComponent } from './rules/rules.component';
import { LegalRoutingModule } from './legal-routing.module';


@NgModule({
  declarations: [TermsComponent, PrivacyComponent, GuidelinesComponent, RulesComponent],
  imports: [
    LegalRoutingModule
  ]
})
export class LegalModule { }
