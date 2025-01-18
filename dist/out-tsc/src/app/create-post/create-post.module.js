import { __decorate } from "tslib";
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CreatePostComponent } from './create-post.component';
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';
import { CreatePostRoutingModule } from './create-post-routing.module';
let CreatePostModule = class CreatePostModule {
};
CreatePostModule = __decorate([
    NgModule({
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
], CreatePostModule);
export { CreatePostModule };
//# sourceMappingURL=create-post.module.js.map