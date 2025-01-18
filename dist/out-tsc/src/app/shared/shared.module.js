import { __decorate } from "tslib";
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InViewportModule } from 'ng-in-viewport';
import { FormsModule } from '@angular/forms';
import { AnswerItemComponent } from '../thread-detail/timeline-item/answer-item/answer-item.component';
import { TimelineItemComponent } from '../thread-detail/timeline-item/timeline-item.component';
import { TakeTimelineItemComponent } from '../take-detail/take-timeline-item/take-timeline-item.component';
import { TakeAnswerItemComponent } from '../take-detail/take-timeline-item/take-answer-item/take-answer-item.component';
import { SafeHtmlPipe } from './safe-html.pipe';
import { EditCommentComponent } from '../edit-comment/edit-comment.component';
import { AppShellRenderDirective } from './shell.directive';
import { AppShellNoRenderDirective } from './no-shell.directive';
import { LazyLoadImageModule } from 'ng-lazyload-image';
let SharedModule = class SharedModule {
};
SharedModule = __decorate([
    NgModule({
        imports: [CommonModule, InViewportModule, FormsModule, LazyLoadImageModule],
        declarations: [TimelineItemComponent, AnswerItemComponent, TakeTimelineItemComponent, TakeAnswerItemComponent, SafeHtmlPipe, EditCommentComponent, AppShellRenderDirective, AppShellNoRenderDirective],
        exports: [FormsModule, TimelineItemComponent, AnswerItemComponent, TakeTimelineItemComponent, TakeAnswerItemComponent, SafeHtmlPipe, EditCommentComponent, AppShellRenderDirective, AppShellNoRenderDirective, LazyLoadImageModule]
    })
], SharedModule);
export { SharedModule };
//# sourceMappingURL=shared.module.js.map