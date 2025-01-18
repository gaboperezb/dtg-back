import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CreatePostComponent } from './create-post.component';
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';
import { CreatePostRoutingModule } from './create-post-routing.module';


@NgModule({
  declarations: [CreatePostComponent],
  imports: [
    CommonModule,
    FroalaEditorModule.forRoot(), 
    FroalaViewModule.forRoot(),
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    CreatePostRoutingModule
  ]
})
export class CreatePostModule { }
