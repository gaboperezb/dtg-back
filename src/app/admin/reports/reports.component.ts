import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AdminService } from '../../core/admin.service';
import { AuthService } from '../../core/auth.service';


@Component({
    templateUrl: 'reports.component.html',
    styleUrls: ['reports.component.scss']
})
export class ReportsComponent implements OnInit {

    dbError: string;
    reports: any[];
    loading: boolean = false;
    loadingAccount: boolean = false;
    loadingIP: boolean = false;



    constructor(private adminService: AdminService, private authService: AuthService) { }

    ngOnInit() {
        this.getReports();

    }


    getReports() {
        this.adminService.getReports()
            .subscribe((reports: any[]) => {
             
                this.reports = reports;
             

            },
                (err) => {
                 
                    this.authService.errorMessage = err;
                });
    }


}