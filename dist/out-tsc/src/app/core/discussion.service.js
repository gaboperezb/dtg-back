import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { HttpHeaders, HttpErrorResponse, } from '@angular/common/http';
//Grab everything with import 'rxjs/Rx';
import { throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
let DiscussionService = class DiscussionService {
    constructor(http, authService) {
        this.http = http;
        this.authService = authService;
        this.baseUrl = 'http://localhost:3000/api/discussions';
    }
    deletePost(data) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        return this.http.post(this.baseUrl + "/i/delete-post", data, { headers })
            .pipe(map((res) => {
            let data = res.json().succeded;
            return data;
        }), catchError(this.handleError));
    }
    getDiscussions(gameId, skip, post) {
        let type;
        let userId = this.authService.currentUser ? this.authService.currentUser._id : null;
        if (post)
            type = post;
        else if (post === false)
            type = false;
        else {
            type = null;
        }
        return this.http.get(this.baseUrl + "/" + gameId + "?skip=" + skip + "&type=" + type + "&userId=" + userId)
            .pipe(catchError(this.handleError));
    }
    getInGameDiscussions(gameId) {
        let userId = this.authService.currentUser ? this.authService.currentUser._id : null;
        return this.http.get(this.baseUrl + "/ingame/" + gameId + "?userId=" + userId)
            .pipe(catchError(this.handleError));
    }
    postDiscussion(data, gameId) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        let url = this.baseUrl + "/" + gameId;
        return this.http.post(url, data, { headers })
            .pipe(catchError(this.handleError));
    }
    getAnswers(discussionId) {
        return this.http.get(this.baseUrl + "/" + discussionId + "/answers")
            .pipe(catchError(this.handleError));
    }
    postAnswer(data, gameId, discussionId, text, answerId) {
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
DiscussionService = __decorate([
    Injectable({ providedIn: 'root' })
], DiscussionService);
export { DiscussionService };
//# sourceMappingURL=discussion.service.js.map