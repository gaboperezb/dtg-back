import { __decorate } from "tslib";
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TakeDetailComponent } from './take-detail.component';
import { TakeDetailResolverService } from '../core/take-detail-resolver.service';
const routes = [{ path: '', component: TakeDetailComponent, resolve: { data: TakeDetailResolverService } }];
let TakeDetailRoutingModule = class TakeDetailRoutingModule {
};
TakeDetailRoutingModule = __decorate([
    NgModule({
        imports: [RouterModule.forChild(routes)],
        exports: [RouterModule]
    })
], TakeDetailRoutingModule);
export { TakeDetailRoutingModule };
//# sourceMappingURL=take-detail-routing.module.js.map