import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

import { Observable, of } from 'rxjs';
import {map, catchError, tap} from 'rxjs/operators'


import { AuthService } from '../core/auth.service';

@Injectable({
    providedIn: 'root'
})
export class ResetResolver implements Resolve<Boolean> {

    constructor(private authService: AuthService, private router: Router) { }

    resolve(route: ActivatedRouteSnapshot,
            state: RouterStateSnapshot): Observable<Boolean> {
    
        let token = route.params['token'];
        
        return this.authService.getReset(token)
                                .pipe(map((data: any) => {
                                    if (data.status) {
                                        return data.status;
                                    }
                                    
                                    let error = data.errorMessage || "Token expired";
                                    this.router.navigate(['/'], { queryParams: { resetError: error } })
                                    return null;
                                }),
                                catchError(error => {
                                    
                                    this.router.navigateByUrl('/');
                                    return of(null);
                                }));
    }
}
