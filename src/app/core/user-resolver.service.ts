import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, throwError, of } from 'rxjs';
import { ThreadsService } from './thread.service';
import { IThread, IUser } from '../shared/interfaces';
import { catchError, map, tap } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from './auth.service';
import { TransferState, makeStateKey } from '@angular/platform-browser';
import { isPlatformServer } from '@angular/common';


@Injectable({
	providedIn: 'root'
})
export class UserResolverService implements Resolve<any> {

	constructor(private authService: AuthService, private transferState: TransferState, @Inject(PLATFORM_ID) private platformId: Object) { }

	resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
		let userId = route.params.username;
		const USER_KEY = makeStateKey('user-' + userId);

		if(isPlatformServer(this.platformId)) {
			return  this.authService.getUserByUsername(userId).pipe(map((user: IUser) => {
				return {user}
			}), tap((data) => {
				this.transferState.set(USER_KEY,data.user)

			}),catchError(this.handleError))

		} else {

			if (this.transferState.hasKey(USER_KEY)) {
				const user = this.transferState.get(USER_KEY, null);
				this.transferState.remove(USER_KEY);
				return of({ user });
			} else {
				return  this.authService.getUserByUsername(userId).pipe(map((user: IUser) => {
					return {user}
				}), catchError(this.handleError))
			}

		}

		
	}

	private handleError(error) {
        
			return of({ error: error })
		
      }
}
