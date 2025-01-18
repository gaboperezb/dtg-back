import { __decorate } from "tslib";
import { Component } from '@angular/core';
import { Validators } from '@angular/forms';
let TriviasComponent = class TriviasComponent {
    constructor(formBuilder, adminService, authService) {
        this.formBuilder = formBuilder;
        this.adminService = adminService;
        this.authService = authService;
        this.updated = false;
        this.teams = [];
        this.add = false;
        this.showDetail = false;
        this.loading = false;
        this.filterBy = "NFL";
        this.skip = 0;
        this.trivias = [];
    }
    get formData() { return this.addForm.get('options'); }
    ngOnInit() {
        this.buildForm();
        this.getTrivias();
    }
    buildForm() {
        this.addForm = this.formBuilder.group({
            question: ["", Validators.required],
            options: this.formBuilder.array([this.createItem(), this.createItem()]),
            correctOption: ["", Validators.required],
            league: ["NFL", Validators.required],
        });
    }
    createItem() {
        return this.formBuilder.group({
            option: '',
            picture: ''
        });
    }
    deleteOption(i) {
        this.optionsForm = this.addForm.get('options');
        this.optionsForm.removeAt(i);
    }
    addOption() {
        this.optionsForm = this.addForm.get('options');
        if (this.optionsForm.length < 4) {
            this.optionsForm.push(this.createItem());
        }
        else {
            this.authService.errorMessage = "You have reached the maximum number of options for the trivia";
            setTimeout(() => {
                this.authService.errorMessage = null;
            }, 4000);
        }
    }
    getTrivias() {
        this.adminService.getTrivias(this.skip)
            .subscribe((trivias) => {
            this.trivias = trivias;
            console.log(trivias);
        });
    }
    submit(formValues) {
        this.loading = true;
        let correctOption = formValues.options[formValues.correctOption].option;
        formValues.correctOption = correctOption[0].toUpperCase() + correctOption.slice(1); //Upper
        for (var index = 0; index < formValues.options.length; index++) {
            var element = formValues.options[index];
            formValues.options[index].option = element.option[0].toUpperCase() + element.option.slice(1); //Upper
        }
        this.adminService.addTrivia(formValues)
            .subscribe((trivia) => {
            this.loading = false;
            this.addForm.reset();
            this.updated = true;
            this.trivias.unshift(trivia);
            setTimeout(() => { this.updated = false; }, 5000);
        }, (err) => {
            this.loading = false;
            this.authService.errorMessage = err;
        });
    }
};
TriviasComponent = __decorate([
    Component({
        templateUrl: 'trivias.component.html',
        styleUrls: ['trivias.component.scss']
    })
], TriviasComponent);
export { TriviasComponent };
//# sourceMappingURL=trivias.component.js.map