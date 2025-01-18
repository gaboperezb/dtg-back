import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';

import { AdminService } from '../../core/admin.service';
import { AuthService } from '../../core/auth.service';
import { IfStmt } from '@angular/compiler';


@Component({
    templateUrl: 'trivias.component.html',
    styleUrls: ['trivias.component.scss']
})
export class TriviasComponent implements OnInit {

    get formData() { return <FormArray>this.addForm.get('options'); }
    addForm: FormGroup;
    optionsForm: any;
    updated: boolean = false;
    teams: any = [];
    visibleTeams: any;
    add: boolean = false;
    showDetail: boolean = false;
    loading: boolean = false;
    dbError: string;
    filterBy: string = "NFL";
    skip: number = 0;
    trivias: any = [];

    ngOnInit() {

        this.buildForm();
        this.getTrivias();

    }

    constructor(private formBuilder: FormBuilder, private adminService: AdminService, private authService: AuthService) { }


    buildForm() {
        this.addForm = this.formBuilder.group({

            question: ["", Validators.required],
            type: ["Trivia", Validators.required],
            options: this.formBuilder.array([this.createItem(), this.createItem()]),
            correctOption: [""],
            league: ["NFL", Validators.required],

        });

    }

    createItem(): FormGroup {
        return this.formBuilder.group({
            option: '',
            picture: ''
        });
    }

    deleteOption(i: number) {
        this.optionsForm = this.addForm.get('options') as FormArray;
        this.optionsForm.removeAt(i)
    }

    addOption() {

        this.optionsForm = this.addForm.get('options') as FormArray;
        if (this.optionsForm.length < 4) {
            this.optionsForm.push(this.createItem());

        }
        else {

            this.authService.errorMessage = "You have reached the maximum number of options for the trivia"
            setTimeout(() => {
                this.authService.errorMessage = null;
            }, 4000);
        }
    }


    getTrivias() {
        this.adminService.getTrivias(this.skip)
            .subscribe((trivias) => {
                this.trivias = trivias;

            })
    }


    submit(formValues: any) {

        this.loading = true;
        if (formValues.correctOption) {

            let correctOption = formValues.options[formValues.correctOption].option;
            formValues.correctOption = correctOption[0].toUpperCase() + correctOption.slice(1); //Upper
            for (var index = 0; index < formValues.options.length; index++) {
                var element = formValues.options[index];
                formValues.options[index].option = element.option[0].toUpperCase() + element.option.slice(1); //Upper
            }
        } else {
            delete formValues.correctOption;
        }

        this.adminService.addTrivia(formValues)
            .subscribe((trivia: any) => {
                this.loading = false;
                this.addForm.reset();
                this.updated = true;
                this.trivias.unshift(trivia);
                setTimeout(() => { this.updated = false; }, 5000);

            },
                (err) => {
                    this.loading = false;
                    this.authService.errorMessage = err;
                })


    }

}