import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ThreadDetailComponent } from './thread-detail.component';
import { ThreadDetailResolverService } from '../core/thread-detail-resolver.service';



const routes: Routes = [{ path: '', component: ThreadDetailComponent, resolve: {data: ThreadDetailResolverService} }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ThreadDetailRoutingModule { }
