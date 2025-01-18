import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { HttpHeaders, HttpErrorResponse, } from '@angular/common/http';
//Grab everything with import 'rxjs/Rx';
import { throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
let ThreadDiscussionService = class ThreadDiscussionService {
    constructor(http, authService) {
        this.http = http;
        this.authService = authService;
        this.baseUrl = 'http://localhost:3000/api/thread-discussions';
    }
    deletePost(data) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        return this.http.post(this.baseUrl + "/i/delete-post", data, { headers })
            .pipe(map((res) => {
            let data = res.succeded;
            return data;
        }), catchError(this.handleError));
    }
    getTopDiscussions(threadId, skip) {
        let userId = this.authService.isLoggedIn() ? this.authService.currentUser._id : '0';
        return this.http.get(this.baseUrl + "/" + threadId + '/top' + "?skip=" + skip + '&userId=' + userId)
            .pipe(catchError(this.handleError));
    }
    getDiscussions(threadId, skip) {
        let userId = this.authService.currentUser ? this.authService.currentUser._id : '0';
        return this.http.get(this.baseUrl + "/" + threadId + "?skip=" + skip + "&userId=" + userId)
            .pipe(map((res) => {
            let timeline = res;
            return timeline;
        }), catchError(this.handleError));
    }
    getNewestDiscussions(threadId, skip) {
        let userId = this.authService.currentUser ? this.authService.currentUser._id : '0';
        return this.http.get(this.baseUrl + "/" + threadId + '/new' + "?skip=" + skip + "&userId=" + userId)
            .pipe(map((res) => {
            let timeline = res;
            return timeline;
        }), catchError(this.handleError));
    }
    postDiscussion(data, threadId) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        let url = this.baseUrl + "/" + threadId;
        return this.http.post(url, data, { headers })
            .pipe(catchError(this.handleError));
    }
    getAnswers(discussionId) {
        let userId = this.authService.isLoggedIn() ? this.authService.currentUser._id : '0';
        return this.http.get(this.baseUrl + "/" + discussionId + "/answers?userId=" + userId)
            .pipe(catchError(this.handleError));
    }
    editComment(data) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        let options = { headers: headers };
        return this.http.put(this.baseUrl + '/edit', data, options)
            .pipe(catchError(this.handleError));
    }
    editAnswer(data) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        let options = { headers: headers };
        return this.http.put(this.baseUrl + '/edit/answers', data, options)
            .pipe(catchError(this.handleError));
    }
    deletePostMyThread(data) {
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        headers = headers.append('Authorization', this.authService.token);
        let options = { headers: headers };
        return this.http.post(this.baseUrl + "/i/delete-post-mythread", data, options)
            .pipe(map((res) => {
            let data = res.succeded;
            return data;
        }), catchError(this.handleError));
    }
    getDiscussion(discussionId) {
        return this.http.get(this.baseUrl + "/" + discussionId + "/notification")
            .pipe(catchError(this.handleError));
    }
    postAnswer(data, threadId, discussionId, text, answerId) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        if (answerId)
            data.aId = answerId;
        data.replyText = text;
        let url = this.baseUrl + "/" + discussionId + "/answers";
        return this.http.post(url, data, { headers })
            .pipe(catchError(this.handleError));
    }
    handleError(error) {
        console.error('server error:', error);
        let errorMessage = '';
        if (error instanceof HttpErrorResponse) {
            // client-side error
            errorMessage = 'Oops! Something went wrong';
        }
        else {
            // server-side error
            errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
        }
        return throwError(errorMessage);
    }
};
ThreadDiscussionService = __decorate([
    Injectable({
        providedIn: 'root'
    })
], ThreadDiscussionService);
export { ThreadDiscussionService };
//# sourceMappingURL=thread-discussion.service.js.map