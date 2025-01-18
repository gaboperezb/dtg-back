import { Injectable, PLATFORM_ID, Inject }      from '@angular/core';
import {
  CanActivate, CanLoad, Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot, Route
}                           from '@angular/router';
import { AuthService }      from './auth.service';
import { Observable, of } from 'rxjs';
import {map, catchError, tap} from 'rxjs/operators'
import { isPlatformServer } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class AdminGuard implements CanActivate, CanLoad {
  constructor(private authService: AuthService, private router: Router,  @Inject(PLATFORM_ID) private platformId: Object) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    

    if(isPlatformServer(this.platformId)) {
      return true;
    } else {
      return this.checkAdmin();
    }
  
  }

  canLoad(route: Route): Observable<boolean>{
    return this.authService.checkAuthenticationStatusForGuard()
            .pipe(
                map(e => {
                if (e) {
                    return true;
                }
            }),catchError(() => {
                this.router.navigate(['/']);
                return of(false);
            }));
  }

  checkAdmin(): boolean {
    if (this.authService.currentUser.isAdmin) { return true; }

    // Navigate to the games page
    this.router.navigateByUrl('/');
    return false;
  }

  
}