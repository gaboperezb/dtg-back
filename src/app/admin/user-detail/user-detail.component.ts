import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AdminService } from '../../core/admin.service';
import { Router } from '@angular/router';

@Component({
    selector: 'user-detail',
    templateUrl: "user-detail.component.html",
    styleUrls: ['user-detail.component.scss']
})
export class UserDetailComponent implements OnInit {

    @Input() user: any;
    loadingAccount: boolean = false;
    loadingIP: boolean = false;
    blockedAccount: string = "";
    blockedIP: string = "";

    constructor(private router: Router, private formBuilder: FormBuilder, private adminService: AdminService) {}

    ngOnInit() {
        this.checkText()
    }

    checkText() {
        if(this.user.blocked) {
            this.blockedAccount = "Unblock account";
        } else {
            this.blockedAccount = "Block account";
        }
        if(this.user.blockedIP)  {
            this.blockedIP = "Unblock IP";
        } else {
            this.blockedIP = "Block IP";
        }
    }

    blockAccount() {

        let reason;
        let data;
        if(!this.user.blocked) {
            do  {
                reason = prompt("Reason", this.user.blockedReason || "");
            } while(!reason)
            data = {
                reason,
                id: this.user._id
            }
        } else {
            data = {
                reason: null,
                id: this.user._id
            }
        }
        
        this.loadingAccount = true;
        this.adminService.blockUserAccount(data)
                        .subscribe((success: boolean) => {
                            if(success) {
                                this.loadingAccount = false;
                                this.user.blocked = !this.user.blocked;
                                this.checkText();
                            }
                        },
                        (err)=> {
                            this.loadingAccount = false;
                            
                        }) 
    }

    posts() {
        this.router.navigate(['/admin/posts', this.user._id]);
    }

    comments() {
        this.router.navigate(['/admin/discussions', this.user._id]);
    }

    replies() {
        this.router.navigate(['/admin/replies', this.user._id]);
    }

}