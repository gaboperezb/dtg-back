import { __decorate } from "tslib";
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from './core/auth.guard';
import { PwdResetComponent } from './pwd-reset/pwd-reset.component';
import { PwdForgotComponent } from './pwd-forgot/pwd-forgot.component';
import { ResetResolver } from './core/reset.service';
import { MainComponent } from './main/main.component';
import { PreloadAllModules } from '@angular/router';
import { UserComponent } from './user/user.component';
import { UserResolverService } from './core/user-resolver.service';
import { SettingsComponent } from './settings/settings.component';
import { FeaturedComponent } from './featured/featured.component';
import { FeaturedResolverService } from './core/featured-resolver.service';
import { CreateDiscussionComponent } from './create-discussion/create-discussion.component';
import { SearchComponent } from './search/search.component';
const routes = [
    { path: 'home', component: MainComponent },
    { path: 'create-post', loadChildren: () => import('./create-post/create-post.module').then(m => m.CreatePostModule) },
    { path: 'create-discussion', component: CreateDiscussionComponent, canActivate: [AuthGuard] },
    { path: 'notifications', loadChildren: () => import('./notifications/notifications.module').then(m => m.NotificationsModule) },
    { path: 'search', component: SearchComponent },
    { path: 'me/settings', component: SettingsComponent, canActivate: [AuthGuard] },
    { path: 'featured', component: FeaturedComponent, resolve: { data: FeaturedResolverService } },
    { path: 'posts/:id', loadChildren: () => import('./thread-detail/thread-detail.module').then(m => m.ThreadDetailModule) },
    { path: 'discussions/:id', loadChildren: () => import('./take-detail/take-detail.module').then(m => m.TakeDetailModule) },
    { path: 'u/:username', component: UserComponent, resolve: { data: UserResolverService } },
    { path: 'comments/:id', loadChildren: () => import('./timeline-detail/timeline-detail.module').then(m => m.TimelineDetailModule) },
    { path: 'pwd-reset/:token', component: PwdResetComponent, resolve: { token: ResetResolver } },
    { path: 'pwd-forgot', component: PwdForgotComponent },
    { path: 'admin', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule) },
    { path: 'legal', loadChildren: () => import('./legal/legal.module').then(m => m.LegalModule) },
    { path: "**", redirectTo: 'home' }
];
let AppRoutingModule = class AppRoutingModule {
};
AppRoutingModule = __decorate([
    NgModule({
        imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled', preloadingStrategy: PreloadAllModules, initialNavigation: 'enabled' })],
        exports: [RouterModule]
    })
], AppRoutingModule);
export { AppRoutingModule };
//# sourceMappingURL=app-routing.module.js.map