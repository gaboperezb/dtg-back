import { __decorate } from "tslib";
import { Component, Input } from '@angular/core';
import { Validators } from '@angular/forms';
let BadgeDetailComponent = class BadgeDetailComponent {
    constructor(formBuilder, adminService) {
        this.formBuilder = formBuilder;
        this.adminService = adminService;
        this.showDetail = false;
        this.loading = false;
        this.updated = false;
        this.error = false;
    }
    ngOnInit() {
        this.buildForm();
    }
    buildForm() {
        this.badgeForm = this.formBuilder.group({
            picture: [this.badge.picture, Validators.required],
            nextPicture: [this.badge.nextPicture, Validators.required],
            level: [this.badge.level, Validators.required],
            name: [this.badge.name, Validators.required],
            nextPoints: [this.badge.nextPoints, Validators.required],
            previousPoints: [this.badge.previousPoints, Validators.required],
            nextName: [this.badge.nextName, Validators.required]
        });
    }
    submit(formValues) {
        this.loading = true;
        if (this.badge.level == 1)
            formValues.previousPoints = undefined;
        this.adminService.updateBadge(formValues, this.badge._id)
            .subscribe(() => {
            this.updated = true;
            this.loading = false;
            setTimeout(() => { this.updated = false; }, 5000);
        }, (err) => { this.loading = false; });
    }
};
__decorate([
    Input()
], BadgeDetailComponent.prototype, "badge", void 0);
BadgeDetailComponent = __decorate([
    Component({
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
], BadgeDetailComponent);
export { BadgeDetailComponent };
//# sourceMappingURL=badge-detail.component.js.map