import { Injectable }      from '@angular/core';
import {
  CanActivate, Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot, Route
}                           from '@angular/router';
import { AuthService }      from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class LoginGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.checkLogin();

  }

 
  checkLogin(): boolean {
    if (!this.authService.isLoggedIn()) { return true; }
    return false;
  }

  
}