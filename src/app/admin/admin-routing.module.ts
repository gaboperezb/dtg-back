import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminGuard } from '../core/admin.guard';
import { TeamsComponent } from './teams/teams.component';
import { GamesComponent } from './games/games.component';
import { BadgesComponent } from './badges/badges.component';
import { TriviasComponent } from './trivias/trivias.component';
import { UsersComponent } from './users/users.component';
import { ReportsComponent } from './reports/reports.component';
import { UserPostsComponent } from './user-posts/user-posts.component';
import { UserDiscussionsComponent } from './user-discussions/user-discussions.component';
import { UserRepliesComponent } from './user-replies/user-replies.component';
import { UserDiscussionsResolver } from '../core/user-discussions.resolver.service';
import { UserPostsResolver } from '../core/user-posts.resolver.service';
import { UserRepliesResolver } from '../core/user-replies.resolver.service';


const routes: Routes = [
    
        { path: 'teams', canActivate: [AdminGuard], component: TeamsComponent },
        { path: 'games', canActivate: [AdminGuard], component: GamesComponent},
        { path: 'badges', canActivate: [AdminGuard], component: BadgesComponent },
        { path: 'trivias', canActivate: [AdminGuard], component: TriviasComponent},
        { path: 'users', canActivate: [AdminGuard], component: UsersComponent },
        { path: 'reports', canActivate: [AdminGuard], component: ReportsComponent },
        { path: 'posts/:id', canActivate: [AdminGuard], resolve: {threads: UserPostsResolver}, component: UserPostsComponent},
        { path: 'discussions/:id', canActivate: [AdminGuard], resolve: {discussions: UserDiscussionsResolver}, component: UserDiscussionsComponent},
        { path: 'replies/:id', canActivate: [AdminGuard], resolve: {discussions: UserRepliesResolver}, component: UserRepliesComponent}
      
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
