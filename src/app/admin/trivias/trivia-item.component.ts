import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';

import { AdminService } from '../../core/admin.service';

@Component({
    selector: 'trivia-item',
    templateUrl: "trivia-item.component.html",
    styleUrls: ["trivia-item.component.scss"]
})
export class TriviaItemComponent implements OnInit {

    @Input() trivia: any;
    get formData() { return <FormArray>this.triviaForm.get('options'); }
    showDetail: boolean = false;
    loading: boolean = false;
    triviaForm: FormGroup;
    updated: boolean = false;
    error: boolean = false;
    possibleWinsAndLoses: number = 150;
    wins: number[] = [];
    loses: number[] = [];

    constructor(private formBuilder: FormBuilder, private adminService: AdminService) { }

    ngOnInit() {
        this.buildForm();
        this.trivia.date = new Date(this.trivia.date)
    }

    
    buildForm() {

       let options = this.trivia.options.map(t => {
            return this.formBuilder.group({
                option: t.option,
                picture: t.picture
            });
        })
        
        let correctOption = this.trivia.options.findIndex(o => o._id == this.trivia.correctOption);
        console.log(correctOption)
        if(correctOption == -1) correctOption = null;
        this.triviaForm = this.formBuilder.group({
            question: [this.trivia.question, Validators.required],
            active: [this.trivia.active, Validators.required],
            revealAnswer: [this.trivia.revealAnswer, Validators.required],
            options: this.formBuilder.array(options),
            correctOption: [correctOption || ""],
            league:     [this.trivia.league, Validators.required],
          
        });
    }


    submit(formValues: any) {
        this.loading = true;
        if(formValues.correctOption) formValues.correctOption =  this.trivia.options[formValues.correctOption]._id;
        else {
            delete formValues.correctOption
        }
       
        for (var index = 0; index < formValues.options.length; index++) {
            var element = formValues.options[index];
            formValues.options[index].option = element.option[0].toUpperCase() + element.option.slice(1); //Upper
        }

        console.log(formValues)
        
        this.adminService.updateTrivia(formValues, this.trivia._id)
                        .subscribe((trivia)=> {
                            this.updated = true;
                            this.loading = false;
                            this.trivia = trivia;
                           
                            setTimeout(() =>{ this.updated = false; }, 5000);
                        },
                        (err)=> {this.loading = false;})
       
     
    }


}