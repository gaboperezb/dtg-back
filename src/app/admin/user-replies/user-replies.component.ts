import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AdminService } from '../../core/admin.service';
import { ActivatedRoute } from '@angular/router';
import { ThreadDiscussionService } from '../../core/thread-discussion.service';
import { DiscussionService } from '../../core/discussion.service';
import { AuthService } from 'src/app/core/auth.service';
import { PLATFORM_ID } from '@angular/core';
 import { isPlatformBrowser, isPlatformServer } from '@angular/common';

@Component({
    templateUrl: 'user-replies.component.html',
    styleUrls: ['user-replies.component.scss']
})
export class UserRepliesComponent implements OnInit {

    dbError: any;
    user: any;
    skip: number = 0;
    discussions: any[];
    expandInput: boolean = false;


    ngOnInit() {

        this.discussions = this.route.snapshot.data['discussions'];
    
    }

    constructor(@Inject(PLATFORM_ID) private platformId: Object, private authService: AuthService, private discussionService: DiscussionService, private threadDiscussionService: ThreadDiscussionService, private route: ActivatedRoute, private adminService: AdminService) {

    }


    deleteComment(e: any, answer: any) {

        e.stopPropagation();

        if (isPlatformBrowser(this.platformId)) {
            if (window.confirm("Do you really want to delete this comment?")) {

                let data = {
                    dId: answer._id,
                    aId: answer.answers._id,
                    tId: answer.thread._id,
                    userId: answer.answers.user
                  }
    
                this.threadDiscussionService.deletePost(data)
                    .subscribe((success) => {
                        if (success) {
                            this.discussions = this.discussions.filter(_answer => _answer.answers._id !== answer.answers._id);
    
                        } else {
                            this.authService.errorMessage = "Failed to delete comment";
                            setTimeout(() => { this.authService.errorMessage = null; }, 5000);
                        }
                    },
                        (err) => {
                            this.authService.errorMessage = err;
                        });
            }
         }

        

    }

    deleteGameComment(e: any, answer: any) {

        e.stopPropagation();

        if (isPlatformBrowser(this.platformId)) {
            if (window.confirm("Do you really want to delete this comment?")) {

                let data = {
                    dId: answer._id,
                    aId: answer.answers._id,
                    gId: answer.game._id,
                    userId: answer.answers.user,
                  }
    
    
                this.discussionService.deletePost(data)
                    .subscribe((success) => {
                        if (success) {
                            this.discussions = this.discussions.filter(_answer => _answer.answers._id !== answer.answers._id);
    
                        } else {
                            this.authService.errorMessage = "Failed to delete comment";
                            setTimeout(() => { this.authService.errorMessage = null; }, 5000);
                        }
                    },
                        (err) => {
                            this.authService.errorMessage = err;
                        });
    
            }
         }
        




    }



   

}