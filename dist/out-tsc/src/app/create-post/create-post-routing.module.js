import { __decorate } from "tslib";
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CreatePostComponent } from './create-post.component';
import { AuthGuard } from '../core/auth.guard';
import { CanDeactivateGuard } from '../core/can-deactivate-create.service';
const routes = [{ path: '', component: CreatePostComponent, canActivate: [AuthGuard], canDeactivate: [CanDeactivateGuard] }];
let CreatePostRoutingModule = class CreatePostRoutingModule {
};
CreatePostRoutingModule = __decorate([
    NgModule({
        imports: [RouterModule.forChild(routes)],
        exports: [RouterModule]
    })
], CreatePostRoutingModule);
export { CreatePostRoutingModule };
//# sourceMappingURL=create-post-routing.module.js.map