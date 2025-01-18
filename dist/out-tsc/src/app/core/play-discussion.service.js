import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { HttpHeaders, HttpErrorResponse, } from '@angular/common/http';
//Grab everything with import 'rxjs/Rx';
import { throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
let PlayDiscussionService = class PlayDiscussionService {
    constructor(http, authService) {
        this.http = http;
        this.authService = authService;
        this.baseUrl = 'http://localhost:3000/api/play-discussions';
    }
    deleteTriviaAnswer(data) {
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        headers = headers.append('Authorization', this.authService.token);
        let options = { headers: headers };
        return this.http.post(this.baseUrl + "/i/delete-trivia-answer", data, options)
            .pipe(map((res) => {
            let data = res.succeded;
            return data;
        }), catchError(this.handleError));
    }
    postTriviaAnswer(data, triviaId, discussionId, text, answerId) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        let options = { headers: headers };
        if (answerId)
            data.aId = answerId;
        data.replyText = text;
        let url = this.baseUrl + "/trivias/" + discussionId + "/answers";
        return this.http.post(url, data, options)
            .pipe(catchError(this.handleError));
    }
    deleteTriviaComment(data) {
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        headers = headers.append('Authorization', this.authService.token);
        let options = { headers: headers };
        return this.http.post(this.baseUrl + "/i/delete-trivia-comment", data, options)
            .pipe(map((res) => {
            let data = res.succeded;
            return data;
        }), catchError(this.handleError));
    }
    getNewestTriviaDiscussions(triviaId, skip) {
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        headers = headers.append('Authorization', this.authService.token);
        return this.http.get(this.baseUrl + "/trivias/" + triviaId + "/new?skip=" + skip, { headers })
            .pipe(catchError(this.handleError));
    }
    getTriviaDiscussions(triviaId, skip) {
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        headers = headers.append('Authorization', this.authService.token);
        return this.http.get(this.baseUrl + "/trivias/" + triviaId + "?skip=" + skip, { headers })
            .pipe(catchError(this.handleError));
    }
    getTopTriviaDiscussions(triviaId, skip) {
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        headers = headers.append('Authorization', this.authService.token);
        return this.http.get(this.baseUrl + "/trivias/" + triviaId + "/top?skip=" + skip, { headers })
            .pipe(catchError(this.handleError));
    }
    postTriviaDiscussion(data, triviaId) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        let options = { headers: headers };
        let url = this.baseUrl + "/trivias/" + triviaId;
        return this.http.post(url, data, options)
            .pipe(catchError(this.handleError));
    }
    handleError(error) {
        console.error('server error:', error);
        let errorMessage = '';
        if (error instanceof HttpErrorResponse) {
            // client-side error
            errorMessage = `Oops! Something went wrong`;
        }
        else {
            // server-side error
            errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
        }
        return throwError(errorMessage);
    }
};
PlayDiscussionService = __decorate([
    Injectable({
        providedIn: 'root'
    })
], PlayDiscussionService);
export { PlayDiscussionService };
//# sourceMappingURL=play-discussion.service.js.map