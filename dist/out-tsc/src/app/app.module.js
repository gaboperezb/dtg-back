import { __decorate } from "tslib";
import { BrowserModule, BrowserTransferStateModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { SocketIoModule } from 'ngx-socket-io';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { PwdForgotComponent } from './pwd-forgot/pwd-forgot.component';
import { PwdResetComponent } from './pwd-reset/pwd-reset.component';
import { MainComponent } from './main/main.component';
import { ThreadComponent } from './main/thread/thread.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { TakesComponent } from './main/takes/takes.component';
import { TakeComponent } from './main/takes/take/take.component';
import { InViewportModule } from 'ng-in-viewport';
import { RouteReuseStrategy } from '@angular/router';
import { CacheRouteReuseStrategy } from './shared/routing';
import { ChooseLeaguesComponent } from './choose-leagues/choose-leagues.component';
import { SharedModule } from './shared/shared.module';
import { UserComponent } from './user/user.component';
import { FollowersComponent } from './followers/followers.component';
import { FollowersItemComponent } from './followers/followers-item/followers-item.component';
import { UserCommentItemComponent } from './user/user-comment-item/user-comment-item.component';
import { SettingsComponent } from './settings/settings.component';
import { LevelsComponent } from './levels/levels.component';
import { FeaturedComponent } from './featured/featured.component';
import { CreateDiscussionComponent } from './create-discussion/create-discussion.component';
import { SearchComponent } from './search/search.component';
const config = { url: 'http://localhost:3000', options: { /* reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax : 5000,
    reconnectionAttempts: Infinity */} };
let AppModule = class AppModule {
};
AppModule = __decorate([
    NgModule({
        declarations: [
            HomeComponent,
            LoginComponent,
            AppComponent,
            PwdForgotComponent,
            PwdResetComponent,
            MainComponent,
            TakesComponent,
            ThreadComponent,
            TakeComponent,
            ChooseLeaguesComponent,
            UserComponent,
            FollowersComponent,
            FollowersItemComponent,
            UserCommentItemComponent,
            SettingsComponent,
            LevelsComponent,
            FeaturedComponent,
            CreateDiscussionComponent,
            SearchComponent
        ],
        imports: [
            SocketIoModule.forRoot(config),
            InViewportModule,
            BrowserModule.withServerTransition({ appId: 'serverApp' }),
            InfiniteScrollModule,
            FormsModule,
            ReactiveFormsModule,
            HttpClientModule,
            AppRoutingModule,
            SharedModule,
            BrowserTransferStateModule
        ],
        providers: [{ provide: RouteReuseStrategy, useClass: CacheRouteReuseStrategy }],
        bootstrap: [AppComponent]
    })
], AppModule);
export { AppModule };
//# sourceMappingURL=app.module.js.map