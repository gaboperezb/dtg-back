import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-privacy',
  templateUrl: './privacy.component.html',
  styleUrls: ['./privacy.component.scss']
})
export class PrivacyComponent implements OnInit {

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.authService.toggleAccess = false
    this.authService.register = false;
		this.authService.chooseLeagues = false;
		this.authService.teams = false;
  }

}
