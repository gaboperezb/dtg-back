import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PlayTriviaDetailRoutingModule } from './play-trivia-detail-routing.module';
import { PlayTriviaDetailComponent } from './play-trivia-detail.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { SharedModule } from '../shared/shared.module';
import { SwiperModule } from 'ngx-swiper-wrapper';



@NgModule({
  declarations: [PlayTriviaDetailComponent],
  imports: [
    CommonModule,
    SharedModule,
    SwiperModule,
    PlayTriviaDetailRoutingModule,
    InfiniteScrollModule
  ]
})
export class PlayTriviaDetailModule { }
