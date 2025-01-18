import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { ValidationService } from '../shared/validators.service';

@Component({
  selector: 'app-pwd-reset',
  templateUrl: './pwd-reset.component.html',
  styleUrls: ['./pwd-reset.component.scss']
})
export class PwdResetComponent implements OnInit {

  resetForm: FormGroup;
  errorMessage: string;
  successMessage: string;
  status: boolean;

  constructor(private formBuilder: FormBuilder, private authService: AuthService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {    
      this.buildForm();
  }

  buildForm() {
      this.resetForm = this.formBuilder.group({
        password:     [ "", [Validators.required, ValidationService.passwordValidator]],
        confirmPassword:  [ "", [Validators.required,]]
      });
  }

  submit(formValues: any) {
      let token = this.route.snapshot.params['token'];
      this.authService.postReset(formValues, token)
                      .subscribe((data: {error: any, successMessage: any, user: any}) => {
                          if (data.successMessage && data.user) { 
                              this.authService.successMessage = data.successMessage;
                              setTimeout(()=> {
                                  this.authService.successMessage = null;
                                  this.router.navigate(['/login']);
                              }, 2000);                  
                          }
                          else {this.authService.errorMessage = data.error};
                          
                      },
                      (err) => { 
                          this.authService.errorMessage = err;
                      });


  }

  

}