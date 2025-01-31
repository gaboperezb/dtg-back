import { __decorate } from "tslib";
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UserComponent } from './user.component';
import { UserResolverService } from '../core/user-resolver.service';
const routes = [{ path: '', component: UserComponent, resolve: { data: UserResolverService } }];
let UserRoutingModule = class UserRoutingModule {
};
UserRoutingModule = __decorate([
    NgModule({
        imports: [RouterModule.forChild(routes)],
        exports: [RouterModule]
    })
], UserRoutingModule);
export { UserRoutingModule };
//# sourceMappingURL=user-routing.module.js.map