import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, throwError, of } from 'rxjs';
import { ThreadsService } from './thread.service';
import { IThread, ITake } from '../shared/interfaces';
import { catchError, map, tap } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { TakeService } from './take.service';
import { isPlatformServer } from '@angular/common';
import { makeStateKey, TransferState } from '@angular/platform-browser';


@Injectable({
	providedIn: 'root'
})
export class FeaturedResolverService implements Resolve<any> {

	constructor(private threadsService: ThreadsService, @Inject(PLATFORM_ID) private platformId: Object, private transferState: TransferState) { }

	resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {

		const FEATURED_KEY = makeStateKey('featured-');

		if (isPlatformServer(this.platformId)) {

			let league = this.threadsService.filterBy || 'TOP';
			
			return this.threadsService.getFeaturedUniversal(league, 0).pipe(map((threads: IThread[]) => {
				return { threads }
			}), tap((data) => {
				this.transferState.set(FEATURED_KEY, data.threads);
			}), catchError(this.handleError))

		} else {

			if (this.transferState.hasKey(FEATURED_KEY)) {
				const threads = this.transferState.get(FEATURED_KEY, null);
				this.transferState.remove(FEATURED_KEY);
				return of({ threads });
			} else {
				let league = this.threadsService.filterBy || 'TOP';
				return this.threadsService.getFeatured(league, 0).pipe(map((threads: IThread[]) => {
					return { threads }
				}), catchError(this.handleError))
			}


		}

	}

	private handleError(error) {

		return of({ error: error })

	}
}
