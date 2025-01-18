import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NotificationsComponent } from './notifications.component';
import { NotificationItemComponent } from './notification-item/notification-item.component';
import { NotificationsRoutingModule } from './notifications-routing.module';


@NgModule({
  declarations: [NotificationsComponent, NotificationItemComponent],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    NotificationsRoutingModule
  ]
})
export class NotificationsModule { }
