import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TimelineDetailRoutingModule } from './timeline-detail-routing.module';
import { TimelineDetailComponent } from './timeline-detail.component';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [TimelineDetailComponent],
  imports: [
    CommonModule,
    SharedModule,
    TimelineDetailRoutingModule
  ]
})
export class TimelineDetailModule { }
