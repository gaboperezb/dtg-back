import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private router: Router) { }

  ngOnInit() {
  }


  appstore(){

    if (isPlatformBrowser(this.platformId)) {
      window.location.href = 'https://itunes.apple.com/us/app/discuss-thegame/id1411535287'; 
   }
   
  }
 
  googleplay() {


    if (isPlatformBrowser(this.platformId)) {
      window.location.href = 'https://play.google.com/store/apps/details?id=com.discussthegame'; 
   }
   
  }

  editor() {
    this.router.navigateByUrl('/create')
  }

}
