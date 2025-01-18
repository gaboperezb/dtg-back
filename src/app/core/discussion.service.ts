import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse,  } from '@angular/common/http';
//Grab everything with import 'rxjs/Rx';
import { Observable, throwError } from 'rxjs';
import {map, catchError} from 'rxjs/operators'

import { AuthService } from './auth.service';



@Injectable({providedIn: 'root'})
export class DiscussionService {

    private baseUrl: string = 'https://www.discussthegame.com/api/discussions';


    constructor(private http: HttpClient, public authService: AuthService) { }
    

    deletePost(data:any) {

        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        return this.http.post(this.baseUrl + "/i/delete-post", data, {headers})
                        .pipe(
                            map((res: any) => {
                            let data = res.succeded;
                            return data;
                        }),
                        catchError(this.handleError))

    }

    getDiscussions(gameId: string, skip: number, post: boolean): Observable<any>  {
        let type: boolean;
        let userId= this.authService.currentUser ? this.authService.currentUser._id : null;
        if (post) type = post;
        else if (post === false) type = false
        else { type = null}
        return this.http.get(this.baseUrl + "/" + gameId + "?skip=" + skip  + "&type=" + type + "&userId=" + userId)
                        .pipe(
                        catchError(this.handleError));
    }

    getInGameDiscussions(gameId: string): Observable<any>  {
        let userId= this.authService.currentUser ? this.authService.currentUser._id : null;
        return this.http.get(this.baseUrl + "/ingame/" + gameId + "?userId=" + userId )
                        .pipe(
                        catchError(this.handleError));
    }


    postDiscussion(data:any, gameId: string): Observable<any> {
        
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        let url = this.baseUrl + "/" + gameId;
        return this.http.post(url, data, {headers})
                    .pipe(
                    catchError(this.handleError));


    }

    getAnswers(discussionId:string):Observable<any>  {
        return this.http.get(this.baseUrl + "/" + discussionId + "/answers")
                        .pipe(
                        catchError(this.handleError))

    }

    postAnswer(data:any, gameId: string, discussionId: string, text: string, answerId?: string): Observable<any> {
        
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        if (answerId)  data.aId = answerId
           
        data.replyText = text;
        let url = this.baseUrl + "/" + discussionId + "/answers";
        return this.http.post(url, data, {headers})
                    .pipe(
                        
                    catchError(this.handleError))


    }

    private handleError(error) {
        console.error('server error:', error);
        let errorMessage = '';
        if (error instanceof HttpErrorResponse) {
          // client-side error
          errorMessage = 'Oops! Something went wrong';
        } else {
          // server-side error
          errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
        }
        return throwError(errorMessage);
      }



}