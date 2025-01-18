import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AdminService } from '../../core/admin.service';


@Component({
    selector: 'badge-detail',
    templateUrl: "badge-detail.component.html",
    styles: [`
    li {
        background: white;
        margin-bottom: 15px;
        
    }

    .team-form {
        padding: 20px;
    }

    .main {
        position: relative;
        cursor: pointer;

    }
    
    li:hover {
        -moz-box-shadow: 0 2px 0  #18399B;
        -webkit-box-shadow: 0 2px 0 #18399B;
        box-shadow: 0 2px 0px  #18399B;
    }
    
    .team-pic {
        height: 60px;
        width: 60px;
        object-fit: contain;
        margin: 5px 20px 5px 8px;
    }
    
    .fa-angle-down, .fa-angle-up {
        position: absolute;
        right: 20px;
        top: 22px;
        font-size: 25px;
        color: #949494;
        
    }
    `]
})
export class BadgeDetailComponent implements OnInit {

    @Input() badge: any;
    showDetail: boolean = false;
    loading: boolean = false;
    badgeForm: FormGroup;
    updated: boolean = false;
    error: boolean = false;

    constructor(private formBuilder: FormBuilder, private adminService: AdminService) {}

    ngOnInit() {
        this.buildForm();
    }

    buildForm() {
        this.badgeForm = this.formBuilder.group({
        
            picture: [this.badge.picture, Validators.required],
            nextPicture: [this.badge.nextPicture, Validators.required],
            level:  [this.badge.level ,Validators.required],
            name:  [this.badge.name, Validators.required],
            nextPoints:     [this.badge.nextPoints, Validators.required],
            previousPoints: [this.badge.previousPoints, Validators.required],
            nextName:     [this.badge.nextName, Validators.required]
          
        });
    }

    submit(formValues: any) {
        this.loading = true;
        if (this.badge.level == 1) formValues.previousPoints = undefined;
        
        this.adminService.updateBadge(formValues, this.badge._id)
                        .subscribe(()=> {
                            this.updated = true;
                            this.loading = false;
                            setTimeout(() =>{ this.updated = false; }, 5000);
                        },
                        (err)=> {this.loading = false;})
        



    }




}