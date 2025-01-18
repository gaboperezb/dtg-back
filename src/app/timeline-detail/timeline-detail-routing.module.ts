import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TimelineDetailComponent } from './timeline-detail.component';
import { CommentResolverService } from '../core/comment-resolver.service';

const routes: Routes = [{ path: '', component: TimelineDetailComponent, resolve: {data: CommentResolverService} }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TimelineDetailRoutingModule { }
