import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AdminService } from '../../core/admin.service';

import { Router } from '@angular/router';

@Component({
    selector: 'report-detail',
    templateUrl: "report-detail.component.html",
    styleUrls: ['report-detail.component.scss']
})
export class ReportDetailComponent implements OnInit {

    @Input() report: any;
   

    constructor(private adminService: AdminService, private router: Router) {}


    review() {
        this.report.reviewed = !this.report.reviewed;
        let data = {
            reviewed: this.report.reviewed
        }
        this.adminService.updateReport(data, this.report._id)
                        .subscribe((report) => {

                        })
    }

    ngOnInit() {
        
    }

    posts(id: string) {
        this.router.navigate(['/admin/posts', id]);
    }

    comments(id: string) {
        this.router.navigate(['/admin/discussions', id]);
    }

    replies(id: string) {
        this.router.navigate(['/admin/replies', id]);
    }


}