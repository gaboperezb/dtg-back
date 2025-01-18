import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AdminService } from '../../core/admin.service';
import { AuthService } from '../../core/auth.service';
import { ActivatedRoute } from '@angular/router';
import { ThreadDiscussionService } from '../../core/thread-discussion.service';
import { DiscussionService } from '../../core/discussion.service';
 import { isPlatformBrowser, isPlatformServer } from '@angular/common';


@Component({
    templateUrl: 'user-discussions.component.html',
    styleUrls: ['user-discussions.component.scss']
})
export class UserDiscussionsComponent implements OnInit {

    dbError: any;
    user: any;
    skip: number = 0;
    discussions: any;
    expandInput: boolean = false;


    ngOnInit() {

        this.discussions = this.route.snapshot.data['discussions'];
    
    }

    constructor(@Inject(PLATFORM_ID) private platformId: Object, private discussionService: DiscussionService, private authService:AuthService, private threadDiscussionService: ThreadDiscussionService, private route: ActivatedRoute, private adminService: AdminService) {

    }


    deleteComment(e: any, timeline: any) {

        e.stopPropagation();

        if (isPlatformBrowser(this.platformId)) {
            // Client only code.
            if (window.confirm("Do you really want to delete this comment?")) {

                let data = {
                    dId: timeline._id,
                    userId: timeline.user,
                    tId: timeline.thread._id //id
                }
    
                this.threadDiscussionService.deletePost(data)
                    .subscribe((success) => {
                        if (success) {
                            this.discussions = this.discussions.filter(_discussion => _discussion._id != timeline._id);
    
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

    deleteGameComment(e: any, comment: any) {

        e.stopPropagation();

        if (isPlatformBrowser(this.platformId)) {

            if (window.confirm("Do you really want to delete this comment?")) {
                let data = {
                    dId: comment._id,
                    gId: comment.game._id,
                    userId: comment.user
                }

                this.discussionService.deletePost(data)
                    .subscribe((success) => {
                        if (success) {
                            this.discussions = this.discussions.filter(_discussion => _discussion._id != comment._id);
    
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

    toggleResponse() {
        this.expandInput = true; 
    }

   

}