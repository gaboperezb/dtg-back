import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreatePostModule } from './create-post/create-post.module';
import { AuthGuard } from './core/auth.guard';
import { CanDeactivateGuard } from './core/can-deactivate-create.service';
import { PrivacyComponent } from './legal/privacy/privacy.component';
import { TermsComponent } from './legal/terms/terms.component';
import { PwdResetComponent } from './pwd-reset/pwd-reset.component';
import { PwdForgotComponent } from './pwd-forgot/pwd-forgot.component';
import { ResetResolver } from './core/reset.service';
import { AdminGuard } from './core/admin.guard';

import { TeamsComponent } from './admin/teams/teams.component';
import { GamesComponent } from './admin/games/games.component';
import { UsersComponent } from './admin/users/users.component';
import { ReportsComponent } from './admin/reports/reports.component';
import { BadgesComponent } from './admin/badges/badges.component';
import { UserPostsComponent } from './admin/user-posts/user-posts.component';
import { UserDiscussionsComponent } from './admin/user-discussions/user-discussions.component';
import { UserRepliesComponent } from './admin/user-replies/user-replies.component';
import { UserPostsResolver } from './core/user-posts.resolver.service';
import { UserRepliesResolver } from './core/user-replies.resolver.service';
import { UserDiscussionsResolver } from './core/user-discussions.resolver.service';
import { GuidelinesComponent } from './legal/guidelines/guidelines.component';
import { RulesComponent } from './legal/rules/rules.component';
import { TriviasComponent } from './admin/trivias/trivias.component';
import { MainComponent } from './main/main.component';
import { PreloadAllModules } from '@angular/router';
import { UserComponent } from './user/user.component';
import { UserResolverService } from './core/user-resolver.service';
import { SettingsComponent } from './settings/settings.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { FeaturedComponent } from './featured/featured.component';
import { FeaturedResolverService } from './core/featured-resolver.service';
import { CreateDiscussionComponent } from './create-discussion/create-discussion.component';
import { SearchComponent } from './search/search.component';
const routes: Routes = [
  { path: 'home', component: MainComponent}, //ya
  { path: 'create-post',  loadChildren: () => import('./create-post/create-post.module').then(m => m.CreatePostModule)}, //ya
  { path: 'create-discussion', component: CreateDiscussionComponent, canActivate: [AuthGuard]},  //ya
  { path: 'notifications',  loadChildren: () => import('./notifications/notifications.module').then(m => m.NotificationsModule)}, //ya
  { path: 'search', component: SearchComponent},
  { path: 'me/settings', component: SettingsComponent, canActivate: [AuthGuard]},
  { path: 'featured', component: FeaturedComponent, resolve: {data: FeaturedResolverService}}, //ya
  { path: 'posts/:id', loadChildren: () => import('./thread-detail/thread-detail.module').then(m => m.ThreadDetailModule) }, //ya
  { path: 'discussions/:id', loadChildren: () => import('./take-detail/take-detail.module').then(m => m.TakeDetailModule) }, //ya
  { path: 'u/:username', component: UserComponent, resolve: {data: UserResolverService} }, //ya
  { path: 'comments/:id', loadChildren: () => import('./timeline-detail/timeline-detail.module').then(m => m.TimelineDetailModule) },
  { path: 'pwd-reset/:token', component: PwdResetComponent, resolve: {token: ResetResolver}},
  { path: 'pwd-forgot', component: PwdForgotComponent},
  {path: 'admin',  loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)},
  {path: 'legal',  loadChildren: () => import('./legal/legal.module').then(m => m.LegalModule)},
  { path: 'trivia/:id', loadChildren: () => import('./play-trivia-detail/play-trivia-detail.module').then(m => m.PlayTriviaDetailModule) },
  {path: "**", redirectTo: 'home'}

];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled', preloadingStrategy: PreloadAllModules, initialNavigation: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
