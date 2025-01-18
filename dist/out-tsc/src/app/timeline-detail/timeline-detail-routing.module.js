import { __decorate } from "tslib";
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TimelineDetailComponent } from './timeline-detail.component';
import { CommentResolverService } from '../core/comment-resolver.service';
const routes = [{ path: '', component: TimelineDetailComponent, resolve: { data: CommentResolverService } }];
let TimelineDetailRoutingModule = class TimelineDetailRoutingModule {
};
TimelineDetailRoutingModule = __decorate([
    NgModule({
        imports: [RouterModule.forChild(routes)],
        exports: [RouterModule]
    })
], TimelineDetailRoutingModule);
export { TimelineDetailRoutingModule };
//# sourceMappingURL=timeline-detail-routing.module.js.map