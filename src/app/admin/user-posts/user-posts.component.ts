import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AdminService } from '../../core/admin.service';
import { AuthService } from '../../core/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ThreadsService } from '../../core/thread.service';
import { PLATFORM_ID } from '@angular/core';
 import { isPlatformBrowser, isPlatformServer } from '@angular/common';

@Component({

    templateUrl: 'user-posts.component.html',
    styleUrls: ['user-posts.component.scss']
})
export class UserPostsComponent implements OnInit {

    dbError: any;
    user: any;
    skip: number = 0;
    threads: any;


    ngOnInit() {
        
        this.threads = this.route.snapshot.data['threads'];
    }

    constructor(private threadsService: ThreadsService, 
        private route: ActivatedRoute,
        @Inject(PLATFORM_ID) private platformId: Object, 
        private adminService: AdminService, 
        private authService: AuthService,
        private router: Router) {
        
    }

    edit(thread: any) {
        

		this.threadsService.threadToEdit = thread;
		this.router.navigateByUrl('/create');
	}


    deletePost(e:any, thread: any) {

        e.stopPropagation();

        if (isPlatformBrowser(this.platformId)) {
            if (window.confirm("Do you really want to delete this thread?")) {

                let data = {
                    tId: thread._id,
                    userId: thread.user
                }

                this.threadsService.deleteThread(data)
                                    .subscribe((success) => {
                                        if (success) {
                                            this.threads = this.threads.filter(_thread => _thread._id != thread._id);
                                
                                        } else {
                                            this.authService.errorMessage = "Failed to delete thread";
                                            setTimeout(() =>{ this.authService.errorMessage = null; }, 5000);
                                        }
                                    },
                                    (err) => {
                                        this.authService.errorMessage = err;
                                    });   
                }  
         }
        
            

        }
        
}