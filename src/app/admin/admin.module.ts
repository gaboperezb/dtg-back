import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { TeamsComponent } from './teams/teams.component';
import { TeamDetailComponent } from './team-detail/team-detail.component';
import { GameDetailComponent } from './game-detail/game-detail.component';
import { GamesComponent } from './games/games.component';
import { TeamFilterPipe } from './team-filter.pipe';
import { BadgesComponent } from './badges/badges.component';
import { BadgeDetailComponent } from './badge-detail/badge-detail.component';
import { UsersComponent } from './users/users.component';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { ReportsComponent } from './reports/reports.component';
import { ReportDetailComponent } from './report-detail/report-detail.component';
import { UserPostsComponent } from './user-posts/user-posts.component';
import { UserDiscussionsComponent } from './user-discussions/user-discussions.component';
import { UserRepliesComponent } from './user-replies/user-replies.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TriviasComponent } from './trivias/trivias.component';
import { TriviaItemComponent } from './trivias/trivia-item.component';
import { AdminRoutingModule } from './admin-routing.module';


@NgModule({
    imports: [
        FormsModule, 
        ReactiveFormsModule,
        CommonModule,
        RouterModule,
        AdminRoutingModule    
    ],
    declarations: [TriviaItemComponent, UserRepliesComponent, UserDiscussionsComponent, UserPostsComponent, ReportsComponent, ReportDetailComponent,TeamsComponent, TeamDetailComponent,GamesComponent,TeamFilterPipe, GameDetailComponent, BadgesComponent, BadgeDetailComponent, UsersComponent, UserDetailComponent, UserDiscussionsComponent, UserRepliesComponent, TriviasComponent],
})
export class AdminModule {}