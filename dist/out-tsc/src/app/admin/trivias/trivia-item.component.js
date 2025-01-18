import { __decorate } from "tslib";
import { Component, Input } from '@angular/core';
import { Validators } from '@angular/forms';
let TriviaItemComponent = class TriviaItemComponent {
    constructor(formBuilder, adminService) {
        this.formBuilder = formBuilder;
        this.adminService = adminService;
        this.showDetail = false;
        this.loading = false;
        this.updated = false;
        this.error = false;
        this.possibleWinsAndLoses = 150;
        this.wins = [];
        this.loses = [];
    }
    get formData() { return this.triviaForm.get('options'); }
    ngOnInit() {
        this.buildForm();
        this.trivia.date = new Date(this.trivia.date);
    }
    buildForm() {
        let options = this.trivia.options.map(t => {
            return this.formBuilder.group({
                option: t.option,
                picture: t.picture
            });
        });
        let correctOption = this.trivia.options.findIndex(o => o._id == this.trivia.correctOption);
        this.triviaForm = this.formBuilder.group({
            question: [this.trivia.question, Validators.required],
            active: [this.trivia.active, Validators.required],
            revealAnswer: [this.trivia.revealAnswer, Validators.required],
            options: this.formBuilder.array(options),
            correctOption: [correctOption, Validators.required],
            league: [this.trivia.league, Validators.required],
        });
    }
    submit(formValues) {
        this.loading = true;
        formValues.correctOption = this.trivia.options[formValues.correctOption]._id;
        for (var index = 0; index < formValues.options.length; index++) {
            var element = formValues.options[index];
            formValues.options[index].option = element.option[0].toUpperCase() + element.option.slice(1); //Upper
        }
        this.adminService.updateTrivia(formValues, this.trivia._id)
            .subscribe((trivia) => {
            this.updated = true;
            this.loading = false;
            this.trivia = trivia;
            console.log(trivia);
            setTimeout(() => { this.updated = false; }, 5000);
        }, (err) => { this.loading = false; });
    }
};
__decorate([
    Input()
], TriviaItemComponent.prototype, "trivia", void 0);
TriviaItemComponent = __decorate([
    Component({
        selector: 'trivia-item',
        templateUrl: "trivia-item.component.html",
        styleUrls: ["trivia-item.component.scss"]
    })
], TriviaItemComponent);
export { TriviaItemComponent };
//# sourceMappingURL=trivia-item.component.js.map