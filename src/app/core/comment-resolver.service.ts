import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, throwError, of } from 'rxjs';
import { ThreadsService } from './thread.service';
import { IThread, ITake } from '../shared/interfaces';
import { catchError, map } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { TakeService } from './take.service';
import { ThreadDiscussionService } from './thread-discussion.service';
import { AuthService } from './auth.service';
import { isPlatformBrowser } from '@angular/common';


@Injectable({
	providedIn: 'root'
})
export class CommentResolverService implements Resolve<any> {

	constructor(private threadDiscussionService: ThreadDiscussionService, private authService: AuthService, private router: Router, @Inject(PLATFORM_ID) private platformId: Object) { }

	resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
		let id = route.params.id

		return  this.threadDiscussionService.getDiscussion(id).pipe(map((comment: ITake) => {
			return {comment}
		}), catchError(error => {
			this.authService.errorMessage = "Not found";

			if(isPlatformBrowser(this.platformId)) {
				setTimeout(() => {
					this.authService.errorMessage = null;
				}, 5000);
			}
			
			this.router.navigateByUrl('/')
			return of({ error: error })
		}));
	}

}
