import { __decorate } from "tslib";
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TakeDetailRoutingModule } from './take-detail-routing.module';
import { TakeDetailComponent } from './take-detail.component';
import { InViewportModule } from 'ng-in-viewport';
import { SharedModule } from '../shared/shared.module';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
let TakeDetailModule = class TakeDetailModule {
};
TakeDetailModule = __decorate([
    NgModule({
        declarations: [TakeDetailComponent],
        imports: [
            CommonModule,
            SharedModule,
            InViewportModule,
            InfiniteScrollModule,
            TakeDetailRoutingModule
        ]
    })
], TakeDetailModule);
export { TakeDetailModule };
//# sourceMappingURL=take-detail.module.js.map