import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.scss']
})
export class TermsComponent implements OnInit {

  constructor(private authService: AuthService) { }

  ngOnInit() {

    this.authService.toggleAccess = false;
    this.authService.register = false;
		this.authService.chooseLeagues = false;
		this.authService.teams = false;
  }

}
