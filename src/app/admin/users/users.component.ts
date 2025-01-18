import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AdminService } from '../../core/admin.service';
import { AuthService } from '../../core/auth.service';


@Component({
    templateUrl: 'users.component.html',
    styleUrls: ['users.component.scss']
})
export class UsersComponent implements OnInit {

    dbError: string;
    usernameForm: FormGroup;
    users: any[];
    loading: boolean = false;
    loadingAccount: boolean = false;
    loadingIP: boolean = false;

 
    ngOnInit() {
        this.buildForm();
        
    }

    constructor(private formBuilder: FormBuilder, private adminService: AdminService, private authService: AuthService) {}

    buildForm() {
        this.usernameForm = this.formBuilder.group({
            username: ["", Validators.required]
        });
    }


    submit(formValues: any) {
        this.loading = true;
        this.adminService.getUsers(formValues)
                        .subscribe((users:  any[]) => {
                            this.loading = false;
                            users.forEach(user => {
                             
                                user.timeSpent.timeSpent = (+user.timeSpent.timeSpent * 2.77778e-7).toFixed(2);
                            })
                            this.users = users;
                            this.usernameForm.reset();
                            
                        },
                        (err)=> {
                            this.loading = false;
                            this.authService.errorMessage = err;
                        })

    }

}