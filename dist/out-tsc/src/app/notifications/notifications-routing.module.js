import { __decorate } from "tslib";
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../core/auth.guard';
import { NotificationsComponent } from './notifications.component';
const routes = [{ path: '', component: NotificationsComponent, canActivate: [AuthGuard] }];
let NotificationsRoutingModule = class NotificationsRoutingModule {
};
NotificationsRoutingModule = __decorate([
    NgModule({
        imports: [RouterModule.forChild(routes)],
        exports: [RouterModule]
    })
], NotificationsRoutingModule);
export { NotificationsRoutingModule };
//# sourceMappingURL=notifications-routing.module.js.map