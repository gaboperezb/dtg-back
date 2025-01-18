import { __decorate } from "tslib";
import { Component, Input } from '@angular/core';
let UserDetailComponent = class UserDetailComponent {
    constructor(router, formBuilder, adminService) {
        this.router = router;
        this.formBuilder = formBuilder;
        this.adminService = adminService;
        this.loadingAccount = false;
        this.loadingIP = false;
        this.blockedAccount = "";
        this.blockedIP = "";
    }
    ngOnInit() {
        this.checkText();
    }
    checkText() {
        if (this.user.blocked) {
            this.blockedAccount = "Unblock account";
        }
        else {
            this.blockedAccount = "Block account";
        }
        if (this.user.blockedIP) {
            this.blockedIP = "Unblock IP";
        }
        else {
            this.blockedIP = "Block IP";
        }
    }
    blockAccount() {
        let reason;
        let data;
        if (!this.user.blocked) {
            do {
                reason = prompt("Reason", this.user.blockedReason || "");
            } while (!reason);
            data = {
                reason,
                id: this.user._id
            };
        }
        else {
            data = {
                reason: null,
                id: this.user._id
            };
        }
        this.loadingAccount = true;
        this.adminService.blockUserAccount(data)
            .subscribe((success) => {
            if (success) {
                this.loadingAccount = false;
                this.user.blocked = !this.user.blocked;
                this.checkText();
            }
        }, (err) => {
            this.loadingAccount = false;
        });
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
};
__decorate([
    Input()
], UserDetailComponent.prototype, "user", void 0);
UserDetailComponent = __decorate([
    Component({
        selector: 'user-detail',
        templateUrl: "user-detail.component.html",
        styleUrls: ['user-detail.component.scss']
    })
], UserDetailComponent);
export { UserDetailComponent };
//# sourceMappingURL=user-detail.component.js.map