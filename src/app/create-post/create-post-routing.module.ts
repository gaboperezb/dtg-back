import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreatePostComponent } from './create-post.component';
import { AuthGuard } from '../core/auth.guard';
import { CanDeactivateGuard } from '../core/can-deactivate-create.service';



const routes: Routes = [{ path: '', component: CreatePostComponent, canActivate: [AuthGuard], canDeactivate: [CanDeactivateGuard]}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreatePostRoutingModule { }
