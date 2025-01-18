import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { isPlatformServer } from '@angular/common';




@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(
        private router: Router,
        private authService: AuthService,
        @Inject(PLATFORM_ID) private platformId: Object

    ) { }

    
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {

        if(isPlatformServer(this.platformId)) {

            return new Promise((resolve) => {
                    resolve(true)
            })


        } else {

            return new Promise((resolve) => {

                var val = localStorage.getItem('user')
                if (!val) {
                    this.router.navigateByUrl('/')
                    this.authService.toggleAccess = true;
                    this.authService.register = true;
                    this.authService.toggleLogin = false;
                    resolve(false);
                } else {
                    resolve(true)
                }
    
            })

        }

        
    }



}