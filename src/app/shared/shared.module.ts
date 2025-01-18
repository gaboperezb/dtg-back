import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InViewportModule } from 'ng-in-viewport';
import { FormsModule } from '@angular/forms';
import { ThreadComponent } from '../main/thread/thread.component';
import { AnswerItemComponent } from '../thread-detail/timeline-item/answer-item/answer-item.component';
import { TimelineItemComponent } from '../thread-detail/timeline-item/timeline-item.component';
import { TakeTimelineItemComponent } from '../take-detail/take-timeline-item/take-timeline-item.component';
import { TakeAnswerItemComponent } from '../take-detail/take-timeline-item/take-answer-item/take-answer-item.component';
import { SafeHtmlPipe } from './safe-html.pipe';
import { EditCommentComponent } from '../edit-comment/edit-comment.component';
import { AppShellRenderDirective } from './shell.directive';
import { AppShellNoRenderDirective } from './no-shell.directive';
import { LazyLoadImageModule } from 'ng-lazyload-image'; 
import { PlayTriviaAnswerItemComponent } from '../play-trivia-detail/play-trivia-timeline-item/play-trivia-answer-item/play-trivia-answer-item.component';
import { PlayTriviaTimelineItemComponent } from '../play-trivia-detail/play-trivia-timeline-item/play-trivia-timeline-item.component';


@NgModule({
  imports: [CommonModule, InViewportModule, FormsModule, LazyLoadImageModule],
  declarations: [TimelineItemComponent, PlayTriviaAnswerItemComponent, PlayTriviaTimelineItemComponent, AnswerItemComponent, TakeTimelineItemComponent, TakeAnswerItemComponent, SafeHtmlPipe, EditCommentComponent, AppShellRenderDirective, AppShellNoRenderDirective],
  exports: [FormsModule, TimelineItemComponent, AnswerItemComponent, PlayTriviaTimelineItemComponent, PlayTriviaAnswerItemComponent, TakeTimelineItemComponent, TakeAnswerItemComponent, SafeHtmlPipe, EditCommentComponent, AppShellRenderDirective, AppShellNoRenderDirective, LazyLoadImageModule]
})

export class SharedModule { }
