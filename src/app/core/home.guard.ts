import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';




@Injectable({ providedIn: 'root' })
export class HomeGuard implements CanActivate {
    constructor(
        private router: Router
      
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {

        return new Promise((resolve) => {
          
            var val = localStorage.getItem('user')
            
				if (!val) {
                    resolve(true);
				} else {
					this.router.navigateByUrl('/create')
					resolve(false)
				}
			
        })
    }
}