import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PlayTriviaDetailComponent } from './play-trivia-detail.component';

const routes: Routes = [{ path: '', component: PlayTriviaDetailComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlayTriviaDetailRoutingModule { }
