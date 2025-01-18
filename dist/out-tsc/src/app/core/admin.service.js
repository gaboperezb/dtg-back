import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { HttpHeaders, HttpErrorResponse, } from '@angular/common/http';
//Grab everything with import 'rxjs/Rx';
import { throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
let AdminService = class AdminService {
    constructor(http, authService) {
        this.http = http;
        this.authService = authService;
        this.baseTeamUrl = 'http://localhost:3000/api/admin/teams';
        this.baseTriviaUrl = 'http://localhost:3000/api/admin/trivias';
        this.baseUsersUrl = 'http://localhost:3000/api/admin/users';
        this.baseGameUrl = 'http://localhost:3000/api/admin/games';
        this.baseBadgeUrl = 'http://localhost:3000/api/admin/badges';
        this.basePollUrl = 'http://localhost:3000/api/admin/polls';
        this.baseReportUrl = 'http://localhost:3000/api/admin/reports';
        this.basUserPostsUrl = 'http://localhost:3000/api/admin/posts';
        this.basUserDiscussionsUrl = 'http://localhost:3000/api/admin/discussions';
        this.basUserRepliesUrl = 'http://localhost:3000/api/admin/replies';
    }
    deleteGame(data) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        return this.http.post(this.baseGameUrl + "/i/delete-game", data, { headers })
            .pipe(map((res) => {
            let data = res.succeded;
            return data;
        }), catchError(this.handleError));
    }
    addTeam(data) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        return this.http.post(this.baseTeamUrl, data, { headers })
            .pipe(catchError(this.handleError));
    }
    getTrivias(skip) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        return this.http.get(this.baseTriviaUrl + '?skip=' + skip, { headers })
            .pipe(catchError(this.handleError));
    }
    updateTrivia(data, triviaId) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        return this.http.put(this.baseTriviaUrl + "/" + triviaId, data, { headers })
            .pipe(catchError(this.handleError));
    }
    addTrivia(data) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        return this.http.post(this.baseTriviaUrl, data, { headers })
            .pipe(catchError(this.handleError));
    }
    addGame(data) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        return this.http.post(this.baseGameUrl, data, { headers })
            .pipe(catchError(this.handleError));
    }
    addBadge(data) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        return this.http.post(this.baseBadgeUrl, data, { headers })
            .pipe(catchError(this.handleError));
    }
    getBadges() {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        return this.http.get(this.baseBadgeUrl, { headers })
            .pipe(catchError(this.handleError));
    }
    getUsers(data) {
        let username = data.username;
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        return this.http.get(this.baseUsersUrl + "/" + username, { headers })
            .pipe(catchError(this.handleError));
    }
    getReports() {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        return this.http.get(this.baseReportUrl, { headers })
            .pipe(catchError(this.handleError));
    }
    updateBadge(data, badgeId) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        return this.http.put(this.baseBadgeUrl + "/" + badgeId, data, { headers })
            .pipe(catchError(this.handleError));
    }
    updateReport(data, reportId) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        return this.http.put(this.baseReportUrl + "/" + reportId, data, { headers })
            .pipe(catchError(this.handleError));
    }
    blockUserAccount(data) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        return this.http.put(this.baseUsersUrl + "/" + data.id, data, { headers })
            .pipe(catchError(this.handleError));
    }
    getTeams() {
        let headers = new HttpHeaders();
        headers = headers.append('Authorization', this.authService.token);
        return this.http.get(this.baseTeamUrl, { headers })
            .pipe(catchError(this.handleError));
    }
    getUserPosts(user, skip) {
        let headers = new HttpHeaders();
        headers = headers.append('Authorization', this.authService.token);
        return this.http.get(this.basUserPostsUrl + "/" + user + '?skip=' + skip, { headers })
            .pipe(catchError(this.handleError));
    }
    getUserDiscussions(user, skip) {
        let headers = new HttpHeaders();
        headers = headers.append('Authorization', this.authService.token);
        return this.http.get(this.basUserDiscussionsUrl + "/" + user + '?skip=' + skip, { headers })
            .pipe(catchError(this.handleError));
    }
    getUserReplies(user, skip) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        return this.http.get(this.basUserRepliesUrl + "/" + user + '?skip=' + skip, { headers })
            .pipe(catchError(this.handleError));
    }
    getGames(skip, league) {
        let headers = new HttpHeaders();
        headers = headers.append('Authorization', this.authService.token);
        return this.http.get(this.baseGameUrl + "?skip=" + skip + "&league=" + league, { headers })
            .pipe(catchError(this.handleError));
    }
    updateTeam(data, teamId) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        return this.http.put(this.baseTeamUrl + "/" + teamId, data, { headers })
            .pipe(catchError(this.handleError));
    }
    updateGame(data, gameId) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        return this.http.put(this.baseGameUrl + "/" + gameId, data, { headers })
            .pipe(catchError(this.handleError));
    }
    handleError(error) {
        console.error('server error:', error);
        let errorMessage = 'Something went wrong';
        if (error instanceof HttpErrorResponse) {
            // client-side error
            errorMessage = `Something went wrong`;
        }
        else {
            // server-side error
            errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
        }
        return throwError(errorMessage);
    }
};
AdminService = __decorate([
    Injectable({
        providedIn: 'root'
    })
], AdminService);
export { AdminService };
//# sourceMappingURL=admin.service.js.map