import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TakeDetailComponent } from './take-detail.component';
import { TakeDetailResolverService } from '../core/take-detail-resolver.service';

const routes: Routes = [{ path: '', component: TakeDetailComponent, resolve: {data: TakeDetailResolverService}}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TakeDetailRoutingModule { }
