import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';



import { AuthService } from '../core/auth.service';
import { ValidationService } from '../shared/validators.service';


@Component({
  selector: 'app-pwd-forgot',
  templateUrl: './pwd-forgot.component.html',
  styleUrls: ['./pwd-forgot.component.scss']
})
export class PwdForgotComponent implements OnInit {

  forgotForm: FormGroup;
  errorMessage: string;
  successMessage: string;

  constructor(private formBuilder: FormBuilder, private authService: AuthService, private router: Router) { }

  ngOnInit() {
      this.buildForm();

  }

  buildForm() {
      this.forgotForm = this.formBuilder.group({
        email:     [ "", [Validators.required, ValidationService.emailValidator]] 
      });
  }

  submit(formValues: any) {
      this.authService.forgot(formValues)
                      .subscribe((data: {errorMessage: string, successMessage: string}) => {
                          
                          if (data.successMessage) { 
                              
                              this.authService.successMessage = data.successMessage; 
                                                 
                          }
                          else {this.authService.errorMessage = data.errorMessage};
                          
                      },
                      (err) => { 
                          this.authService.errorMessage = err;
                      });


  }

  

}
