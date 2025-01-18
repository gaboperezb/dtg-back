import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { HttpHeaders, HttpErrorResponse, } from '@angular/common/http';
//Grab everything with import 'rxjs/Rx';
import { throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Cacheable } from 'ngx-cacheable';
let TakeService = class TakeService {
    constructor(http, authService, threadsService) {
        this.http = http;
        this.authService = authService;
        this.threadsService = threadsService;
        this.baseUrl = 'http://localhost:3000/api/take';
        this.embdelyURLOauth = 'https://api.embedly.com/1/oembed';
        this.embdelyURLDisplay = 'https://i.embed.ly/1/display/resize';
        this.embedlyKey = "116e3e2241ba42e49a5d9091d51206dd";
        this.leagueToDownload = "TOP";
        this.takesToggled = false;
        this.fullScreen = false;
        this.menuLeagues = [];
        this.nofollowing = false;
        this.placeholders = true;
        this.loaderActive = false; //ion-infinite
        this.loadingFeatured = true;
        this.toggleRefresh = false;
        this.toggleFeaturedRefresh = false;
        this.followers = false;
        this.hot = true;
        this.new = false;
        this.top = false;
        this.videoFullscreen = false;
        this.destroyDiscussions = false; //en lockscreen salen los  controles de video, hay que evitar esto
        this.skip = 0;
        this.skipNewest = 0;
        this.skipTop = 0;
        this.skipFollowers = 0;
        this.takes = [];
        this.refreshTakes = [];
        this.editUrl = '/tabs/tab1';
    }
    edit(id, data) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        let options = { headers: headers };
        return this.http.post(this.baseUrl + '/' + id, data, options)
            .pipe(catchError(this.handleError));
    }
    deleteTake(data) {
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        headers = headers.append('Authorization', this.authService.token);
        let options = { headers: headers };
        return this.http.post(this.baseUrl + "/i/delete-take", data, options)
            .pipe(map((res) => {
            let data = res.succeded;
            return data;
        }), catchError(this.handleError));
    }
    embedlyAPI(url) {
        return this.http.get(this.embdelyURLOauth + '?url=' + url + '&key=' + this.embedlyKey)
            .pipe(catchError(this.handleError));
    }
    boost(take, likes) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        let options = { headers: headers };
        let body = {
            likes
        };
        let url = `${this.baseUrl}/${take}/boost`;
        return this.http.post(url, body, options)
            .pipe(catchError(this.handleError))
            .subscribe();
    }
    embedlyDisplay(url) {
        let headers = new HttpHeaders();
        headers = headers.append('Accept', 'image/*');
        return this.http.get(this.embdelyURLDisplay + '?url=' + url + '&key=' + this.embedlyKey)
            .pipe(catchError(this.handleError));
    }
    getTeamTakes(team, skip) {
        let headers = new HttpHeaders();
        headers = headers.append('Authorization', this.authService.token);
        return this.http.get(this.baseUrl + '/i/teams?team=' + team + '&skip=' + skip + '&limit=10', { headers })
            .pipe(catchError(this.handleError));
    }
    newTake(data) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        let options = { headers: headers };
        return this.http.post(this.baseUrl, data, options)
            .pipe(catchError(this.handleError));
    }
    getTakeDB(id) {
        return this.http.get(this.baseUrl + '/' + id)
            .pipe(catchError(this.handleError));
    }
    getTakeDBUniversal(id) {
        return this.http.get(this.baseUrl + '/' + id)
            .pipe(catchError(this.handleError));
    }
    getFollowingTakes(league, skip) {
        let headers = new HttpHeaders();
        headers = headers.append('Authorization', this.authService.token);
        let options = { headers: headers };
        return this.http.get(this.baseUrl + '/following' + '?league=' + league + '&skip=' + skip + '&limit=10' + '&leagues=' + JSON.stringify(this.threadsService.leagues), options)
            .pipe(catchError(this.handleError));
    }
    getTakes(league, skip) {
        let userId = this.authService.isLoggedIn() ? this.authService.currentUser._id : '0';
        return this.http.get(this.baseUrl + '?league=' + league + '&skip=' + skip + '&leagues=' + JSON.stringify(this.threadsService.leagues) + '&userId=' + userId + '&limit=10')
            .pipe(catchError(this.handleError));
    }
    getNewestTakes(league, skip) {
        let userId = this.authService.isLoggedIn() ? this.authService.currentUser._id : '0';
        return this.http.get(this.baseUrl + "/i/newest" + '?league=' + league + '&skip=' + skip + '&leagues=' + JSON.stringify(this.threadsService.leagues) + '&userId=' + userId + '&limit=10')
            .pipe(catchError(this.handleError));
    }
    getTopTakes(league, skip) {
        let userId = this.authService.isLoggedIn() ? this.authService.currentUser._id : '0';
        return this.http.get(this.baseUrl + "/i/top" + '?league=' + league + '&skip=' + skip + '&leagues=' + JSON.stringify(this.threadsService.leagues) + '&userId=' + userId + '&limit=10')
            .pipe(catchError(this.handleError));
    }
    getTake(id) {
        return this.takes.find(take => take._id === id);
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
    handleError(error) {
        console.error('server error:', error);
        let errorMessage = '';
        if (error instanceof HttpErrorResponse) {
            errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
        }
        else {
            // server-side error
            errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
        }
        return throwError(errorMessage);
    }
};
__decorate([
    Cacheable({
        maxAge: 240000 //4 min
    })
], TakeService.prototype, "getTakeDB", null);
TakeService = __decorate([
    Injectable({
        providedIn: 'root'
    })
], TakeService);
export { TakeService };
//# sourceMappingURL=take.service.js.map