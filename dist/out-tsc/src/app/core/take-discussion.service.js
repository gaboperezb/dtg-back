import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { HttpHeaders, HttpErrorResponse, } from '@angular/common/http';
//Grab everything with import 'rxjs/Rx';
import { throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
let TakeDiscussionService = class TakeDiscussionService {
    constructor(http, authService) {
        this.http = http;
        this.authService = authService;
        this.baseUrl = 'http://localhost:3000/api/take-discussions';
    }
    deletePost(data) {
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        headers = headers.append('Authorization', this.authService.token);
        let options = { headers: headers };
        return this.http.post(this.baseUrl + "/i/delete-post", data, options)
            .pipe(map((res) => {
            let data = res.succeded;
            return data;
        }), catchError(this.handleError));
    }
    postAnswer(data, takeId, discussionId, text, answerId) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        let options = { headers: headers };
        if (answerId)
            data.aId = answerId;
        data.replyText = text;
        let url = this.baseUrl + "/" + discussionId + "/answers";
        return this.http.post(url, data, options)
            .pipe(catchError(this.handleError));
    }
    deletePostMyTake(data) {
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        headers = headers.append('Authorization', this.authService.token);
        let options = { headers: headers };
        return this.http.post(this.baseUrl + "/i/delete-post-mytake", data, options)
            .pipe(map((res) => {
            let data = res.succeded;
            return data;
        }), catchError(this.handleError));
    }
    getNewestDiscussions(takeId, skip) {
        let userId = this.authService.isLoggedIn() ? this.authService.currentUser._id : '0';
        return this.http.get(this.baseUrl + "/" + takeId + '/new' + "?skip=" + skip + '&userId=' + userId)
            .pipe(catchError(this.handleError));
    }
    getDiscussions(takeId, skip) {
        let userId = this.authService.isLoggedIn() ? this.authService.currentUser._id : '0';
        return this.http.get(this.baseUrl + "/" + takeId + "?skip=" + skip + '&userId=' + userId)
            .pipe(catchError(this.handleError));
    }
    getTopDiscussions(takeId, skip) {
        let userId = this.authService.isLoggedIn() ? this.authService.currentUser._id : '0';
        return this.http.get(this.baseUrl + "/" + takeId + '/top' + "?skip=" + skip + '&userId=' + userId)
            .pipe(catchError(this.handleError));
    }
    postDiscussion(data, takeId) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        let options = { headers: headers };
        let url = this.baseUrl + "/" + takeId;
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
TakeDiscussionService = __decorate([
    Injectable({
        providedIn: 'root'
    })
], TakeDiscussionService);
export { TakeDiscussionService };
//# sourceMappingURL=take-discussion.service.js.map