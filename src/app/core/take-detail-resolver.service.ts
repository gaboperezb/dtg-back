import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, throwError, of } from 'rxjs';
import { ThreadsService } from './thread.service';
import { IThread, ITake } from '../shared/interfaces';
import { catchError, map, tap } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { TakeService } from './take.service';
import { AuthService } from './auth.service';
import { isPlatformServer, isPlatformBrowser } from '@angular/common';
import { TransferState, makeStateKey } from '@angular/platform-browser';


@Injectable({
	providedIn: 'root'
})
export class TakeDetailResolverService implements Resolve<any> {

	constructor(private takeService: TakeService, private authService: AuthService,
		private router: Router,
		@Inject(PLATFORM_ID) private platformId: Object,
		private transferState: TransferState) { }


	resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {

		let takeId = route.params.id
		const TAKE_KEY = makeStateKey('take-' + takeId);
		if (isPlatformServer(this.platformId)) { //PARA EVITAR @CACHEABLE EN SERVIDOR

			return this.takeService.getTakeDBUniversal(takeId).pipe(map((take: ITake) => {
				return { take }
			}), tap(data => {
				this.transferState.set(TAKE_KEY, data.take);
			}), catchError(error => {

				if (isPlatformBrowser(this.platformId)) {
					this.authService.errorMessage = "Not found";
					setTimeout(() => {
						this.authService.errorMessage = null;
					}, 5000);
				}
				this.router.navigateByUrl('/')
				return of({ error })

			}));

		} else {

			if (this.transferState.hasKey(TAKE_KEY)) {
				const take = this.transferState.get(TAKE_KEY, null);
				this.transferState.remove(TAKE_KEY);
				return of({ take });
			}
			else {
				return this.takeService.getTakeDB(takeId).pipe(map((take: IThread) => {
					return { take }
				}), catchError(error => {
					if (isPlatformBrowser(this.platformId)) {
						this.authService.errorMessage = "Not found";
						setTimeout(() => {
							this.authService.errorMessage = null;
						}, 5000);
					}
					this.router.navigateByUrl('/')
					return of({ error })
				}));
			}



		}


	}


}
