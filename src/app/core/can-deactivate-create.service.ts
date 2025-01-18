import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { AuthService } from './auth.service';
import { ThreadsService } from './thread.service';


export interface CanComponentDeactivate {
  canDeactivate: () => boolean;
}

@Injectable({
    providedIn: 'root'
})
export class CanDeactivateGuard implements CanDeactivate<CanComponentDeactivate> {

  constructor(private authService: AuthService, private threadService: ThreadsService) {

  }

  canDeactivate(component: CanComponentDeactivate) {

    if(!this.authService.isLoggedIn() || this.threadService.posting){
      return true;
    } else {
      return component.canDeactivate ? component.canDeactivate() : true;
    }
    
  }

}