import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ThreadDetailResolverService } from '../core/thread-detail-resolver.service';
import { PrivacyComponent } from './privacy/privacy.component';
import { GuidelinesComponent } from './guidelines/guidelines.component';
import { RulesComponent } from './rules/rules.component';
import { TermsComponent } from './terms/terms.component';



const routes: Routes = [
{ path: 'privacy-policy', component: PrivacyComponent },
{ path: 'guidelines', component: GuidelinesComponent },
{ path: 'rules', component: RulesComponent },
{ path: 'terms-of-use', component: TermsComponent },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LegalRoutingModule { }
