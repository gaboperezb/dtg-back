import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { HttpHeaders, HttpErrorResponse, } from '@angular/common/http';
//Grab everything with import 'rxjs/Rx';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
let ThreadLikesService = class ThreadLikesService {
    constructor(http, authService) {
        this.http = http;
        this.authService = authService;
        this.baseDiscussionsUrl = 'http://localhost:3000/api/thread-discussions';
        this.baseUrl = 'http://localhost:3000/api/threads';
    }
    postLike(discussionOrAnswer, discussion, likerUsername, answer) {
        let body = answer ? { "aId": answer._id } : {};
        if (answer)
            answer.likers.push(likerUsername);
        else
            discussion.likers.push(likerUsername);
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        let options = { headers: headers };
        let url = `${this.baseDiscussionsUrl}/${discussion._id}/likers/${likerUsername}?discussionOrAnswer=${discussionOrAnswer}`;
        return this.http.post(url, body, options)
            .pipe(catchError(this.handleError))
            .subscribe();
    }
    deleteLike(discussionOrAnswer, discussion, username, answer) {
        let query = answer ? `&answerId=${answer._id}` : "";
        if (answer)
            answer.likers = answer.likers.filter(likerUsername => likerUsername !== username);
        else
            discussion.likers = discussion.likers.filter(likerUsername => likerUsername !== username);
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        let url = `${this.baseDiscussionsUrl}/${discussion._id}/likers/${username}?discussionOrAnswer=${discussionOrAnswer}${query}`;
        return this.http.delete(url, { headers: headers })
            .pipe(catchError(this.handleError))
            .subscribe();
    }
    postThreadLike(thread, user) {
        thread.likers.push(user);
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        let options = { headers: headers };
        let url = `${this.baseUrl}/${thread._id}/likers/${user}`;
        return this.http.post(url, {}, options)
            .pipe(catchError(this.handleError))
            .subscribe();
    }
    deleteThreadLike(thread, user) {
        thread.likers = thread.likers.filter(likerUsername => likerUsername !== user);
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        let options = { headers: headers };
        let url = `${this.baseUrl}/${thread._id}/likers/${user}`;
        return this.http.delete(url, options)
            .pipe(catchError(this.handleError))
            .subscribe();
    }
    //También para respuestas (por eso no se especifica el tipo)
    userHasLiked(discussion, username) {
        return discussion.likers.some((liker) => liker === username);
    }
    //También para respuestas (por eso no se especifica el tipo)
    userHasDisliked(discussion, username) {
        return discussion.dislikers.some((disliker) => disliker === username);
    }
    handleError(error) {
        console.error('server error:', error);
        let errorMessage = '';
        if (error instanceof HttpErrorResponse) {
            // client-side error
            errorMessage = error.message;
        }
        else {
            // server-side error
            errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
        }
        return throwError(errorMessage);
    }
};
ThreadLikesService = __decorate([
    Injectable({
        providedIn: 'root'
    })
], ThreadLikesService);
export { ThreadLikesService };
//# sourceMappingURL=thread-likers.service.js.map