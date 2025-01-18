import { __decorate } from "tslib";
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
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
const routes = [
    { path: 'teams', canActivate: [AdminGuard], component: TeamsComponent },
    { path: 'games', canActivate: [AdminGuard], component: GamesComponent },
    { path: 'badges', canActivate: [AdminGuard], component: BadgesComponent },
    { path: 'trivias', canActivate: [AdminGuard], component: TriviasComponent },
    { path: 'users', canActivate: [AdminGuard], component: UsersComponent },
    { path: 'reports', canActivate: [AdminGuard], component: ReportsComponent },
    { path: 'posts/:id', canActivate: [AdminGuard], resolve: { threads: UserPostsComponent }, component: UserPostsComponent },
    { path: 'discussions/:id', canActivate: [AdminGuard], resolve: { discussions: UserDiscussionsComponent }, component: UserDiscussionsComponent },
    { path: 'replies/:id', canActivate: [AdminGuard], resolve: { discussions: UserRepliesComponent }, component: UserRepliesComponent }
];
let AdminRoutingModule = class AdminRoutingModule {
};
AdminRoutingModule = __decorate([
    NgModule({
        imports: [RouterModule.forChild(routes)],
        exports: [RouterModule]
    })
], AdminRoutingModule);
export { AdminRoutingModule };
//# sourceMappingURL=admin-routing.module.js.map