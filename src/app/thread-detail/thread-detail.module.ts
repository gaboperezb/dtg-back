import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ThreadDetailRoutingModule } from './thread-detail-routing.module';
import { ThreadDetailComponent } from './thread-detail.component';
import { SharedModule } from '../shared/shared.module';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [ThreadDetailComponent],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    InfiniteScrollModule,
    ThreadDetailRoutingModule
  ]
})
export class ThreadDetailModule { }
