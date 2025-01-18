import { __decorate } from "tslib";
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThreadDetailRoutingModule } from './thread-detail-routing.module';
import { ThreadDetailComponent } from './thread-detail.component';
import { SharedModule } from '../shared/shared.module';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { FormsModule } from '@angular/forms';
let ThreadDetailModule = class ThreadDetailModule {
};
ThreadDetailModule = __decorate([
    NgModule({
        declarations: [ThreadDetailComponent],
        imports: [
            CommonModule,
            SharedModule,
            FormsModule,
            InfiniteScrollModule,
            ThreadDetailRoutingModule
        ]
    })
], ThreadDetailModule);
export { ThreadDetailModule };
//# sourceMappingURL=thread-detail.module.js.map