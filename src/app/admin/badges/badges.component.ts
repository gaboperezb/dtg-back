import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AdminService } from '../../core/admin.service';
import { AuthService } from '../../core/auth.service';


@Component({
    templateUrl: 'badges.component.html',
    styleUrls: ['badges.component.scss']
})
export class BadgesComponent implements OnInit {

    badgeForm: FormGroup;
    updated: boolean = false;
    badges: any[] = [];
    add: boolean = false;
    showDetail: boolean = false;
    loading: boolean = false;
    dbError: string;
    filterBy: string = "nfl";

    ngOnInit() {
        
       this.getBadges();
        this.buildForm();
        
    }

    constructor(private formBuilder: FormBuilder, private adminService: AdminService, private authService: AuthService) {}

    getBadges() {
        this.adminService.getBadges()
                        .subscribe((badges: any[]) => {
                          
                            this.badges = badges;
                            
                        },
                        (err) => {
                            
                            this.authService.errorMessage = err;
                        });

    }

    buildForm() {
        this.badgeForm = this.formBuilder.group({
        
            picture: ["", Validators.required],
            level:  ["" ,Validators.required],
            name:  ["", Validators.required],
            nextPoints:     ["", Validators.required],
            nextPicture:     ["", Validators.required],
            previousPoints:     ["", Validators.required],
            nextName:     ["", Validators.required]
          
        });
    }


    submit(formValues: any) {
        this.loading = true;
        this.adminService.addBadge(formValues)
                        .subscribe((badge:  any) => {
                            this.loading = false;
                            this.badgeForm.reset();
                            this.updated = true;
                            this.badges.push(badge);
                            setTimeout(() =>{ this.updated = false; }, 5000);

                        },
                        (err)=> {
                            this.loading = false;
                            this.authService.errorMessage = err;
                        })

    }

}