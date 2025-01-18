import { __decorate } from "tslib";
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NotificationsComponent } from './notifications.component';
import { NotificationItemComponent } from './notification-item/notification-item.component';
import { NotificationsRoutingModule } from './notifications-routing.module';
let NotificationsModule = class NotificationsModule {
};
NotificationsModule = __decorate([
    NgModule({
        declarations: [NotificationsComponent, NotificationItemComponent],
        imports: [
            CommonModule,
            SharedModule,
            FormsModule,
            ReactiveFormsModule,
            NotificationsRoutingModule
        ]
    })
], NotificationsModule);
export { NotificationsModule };
//# sourceMappingURL=notifications.module.js.map