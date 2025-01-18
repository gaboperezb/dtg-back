import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, throwError, of } from 'rxjs';
import { ThreadsService } from './thread.service';
import { IThread } from '../shared/interfaces';
import { catchError, map, tap } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from './auth.service';
import { isPlatformServer, isPlatformBrowser } from '@angular/common';
import { TransferState, makeStateKey } from '@angular/platform-browser';


@Injectable({
	providedIn: 'root'
})
export class TriviaDetailResolverService implements Resolve<any> {

	constructor(private threadService: ThreadsService,
		private authService: AuthService,
		private router: Router,
		private transferState: TransferState,
		@Inject(PLATFORM_ID) private platformId: Object) { }

	resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {

		let triviaId = route.params.id
		const THREAD_KEY = makeStateKey('thread-' + triviaId);

		if (isPlatformServer(this.platformId)) { //PARA EVITAR @CACHEABLE EN SERVIDOR

			return this.threadService.getThreadDBUniversal(triviaId).pipe(map((thread: IThread) => {
				return { thread }
			}), tap(data => {
				
				this.transferState.set(THREAD_KEY, data.thread); 
			}), catchError(error => {
				this.router.navigateByUrl('/')
				return of({ error })

			}));

		} else {

			if (this.transferState.hasKey(THREAD_KEY)) {
				console.log('ii')
				const thread = this.transferState.get(THREAD_KEY, null);
				console.log(thread)
				this.transferState.remove(THREAD_KEY);
				return of({thread});
			}
			else {
				return this.threadService.getThreadDB(triviaId).pipe(map((thread: IThread) => {
					return { thread }
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
