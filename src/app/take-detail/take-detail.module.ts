import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TakeDetailRoutingModule } from './take-detail-routing.module';
import { TakeDetailComponent } from './take-detail.component';
import { InViewportModule } from 'ng-in-viewport';
import { SharedModule } from '../shared/shared.module';
import { TakeTimelineItemComponent } from './take-timeline-item/take-timeline-item.component';
import { TakeAnswerItemComponent } from './take-timeline-item/take-answer-item/take-answer-item.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';


@NgModule({
  declarations: [TakeDetailComponent],
  imports: [
    CommonModule,
    SharedModule,
    InViewportModule,
    InfiniteScrollModule,
    TakeDetailRoutingModule
  ]
})
export class TakeDetailModule { }
