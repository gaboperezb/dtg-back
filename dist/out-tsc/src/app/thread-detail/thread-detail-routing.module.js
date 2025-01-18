import { __decorate } from "tslib";
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ThreadDetailComponent } from './thread-detail.component';
import { ThreadDetailResolverService } from '../core/thread-detail-resolver.service';
const routes = [{ path: '', component: ThreadDetailComponent, resolve: { data: ThreadDetailResolverService } }];
let ThreadDetailRoutingModule = class ThreadDetailRoutingModule {
};
ThreadDetailRoutingModule = __decorate([
    NgModule({
        imports: [RouterModule.forChild(routes)],
        exports: [RouterModule]
    })
], ThreadDetailRoutingModule);
export { ThreadDetailRoutingModule };
//# sourceMappingURL=thread-detail-routing.module.js.map