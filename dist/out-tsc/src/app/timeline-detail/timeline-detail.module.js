import { __decorate } from "tslib";
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimelineDetailRoutingModule } from './timeline-detail-routing.module';
import { TimelineDetailComponent } from './timeline-detail.component';
import { SharedModule } from '../shared/shared.module';
let TimelineDetailModule = class TimelineDetailModule {
};
TimelineDetailModule = __decorate([
    NgModule({
        declarations: [TimelineDetailComponent],
        imports: [
            CommonModule,
            SharedModule,
            TimelineDetailRoutingModule
        ]
    })
], TimelineDetailModule);
export { TimelineDetailModule };
//# sourceMappingURL=timeline-detail.module.js.map