import { __decorate, __param } from "tslib";
import { Injectable, Inject } from '@angular/core';
import { HttpHeaders, HttpErrorResponse, } from '@angular/common/http';
//Grab everything with import 'rxjs/Rx';
import { throwError, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Cacheable } from 'ngx-cacheable';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
let AuthService = class AuthService {
    constructor(http, seoService, webSocketService, titleService, platformId) {
        this.http = http;
        this.seoService = seoService;
        this.webSocketService = webSocketService;
        this.titleService = titleService;
        this.platformId = platformId;
        this.toggleAccess = false;
        this.toggleLogin = false;
        this.errorMessage = "";
        this.successMessage = "";
        this.disableTabs = true; //para que no le piquen muy rapido
        this.gettingAnswers = false;
        this.toggleUsername = false;
        this.google = false;
        this.facebook = false;
        this.wifi = false;
        this.showAddComment = true;
        this.notifications = 0;
        this.downloadProfile = true;
        this.downloadNotifications = true;
        this.showLikeHelp = false;
        this.leveledUp = false;
        this.initialTimeSpent = Date.now();
        this.visibleNotifications = []; //Para el componente de notifications
        this.noScroll = false;
        this.scroll = false;
        this.addurl = true;
        this.followInfo = false;
        this.levelsInfo = false;
        this.teams = false;
        this.chooseLeagues = false;
        this.register = false;
        this.userIdToDownload = "";
        if (isPlatformBrowser(this.platformId)) {
            var val = localStorage.getItem('user');
            if (!!val && typeof val !== "object" && val !== "[object Object]") {
                this.currentUser = JSON.parse(val);
                if (!this.currentUser.leagues.length)
                    this.chooseLeagues = true;
            }
        }
    }
    getSignedRequest(fileName, fileType) {
        let headers = new HttpHeaders();
        headers = headers.append('Authorization', this.token);
        let url = `http://localhost:3000/api/user/sign-s3?file-name=${fileName}&file-type=${fileType}`;
        return this.http.get(url, { headers: headers })
            .pipe(catchError(this.handleError));
    }
    unblockUser(user) {
        let data = {
            user
        };
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        headers = headers.append('Authorization', this.token);
        return this.http.post("http://localhost:3000/api/user/unblock", data, { headers: headers })
            .pipe(catchError(this.handleError));
    }
    blockUser(user) {
        let data = {
            user
        };
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        headers = headers.append('Authorization', this.token);
        return this.http.post("http://localhost:3000/api/user/block", data, { headers: headers })
            .pipe(catchError(this.handleError));
    }
    reportUser(user, reason, chat) {
        let data = {
            user,
            reason,
            chat
        };
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        headers = headers.append('Authorization', this.token);
        return this.http.post("http://localhost:3000/api/user/report", data, { headers: headers })
            .pipe(catchError(this.handleError));
    }
    getNotis() {
        let headers = new HttpHeaders();
        headers = headers.append('Authorization', this.token);
        return this.http.get('http://localhost:3000/api/user/notis', { headers: headers })
            .pipe(catchError(this.handleError));
    }
    clearNotifications(newNotifications, type) {
        let data = {
            newNotifications,
            type
        };
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.token);
        let options = { headers: headers };
        return this.http.put('http://localhost:3000/api/user/clear-notifications', data, options)
            .pipe(catchError(this.handleError));
    }
    deleteProfilePicture(fileName, fileNameThumbnail) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.token);
        let url = 'http://localhost:3000/api/user/files/' + fileName + '/' + fileNameThumbnail;
        return this.http.delete(url, { headers: headers })
            .pipe(map((res) => {
            let data = res.deleted;
            return data;
        }), catchError(this.handleError));
    }
    changePassword(data) {
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        headers = headers.append('Authorization', this.token);
        let options = { headers: headers };
        return this.http.post('http://localhost:3000/api/user/change-password', data, options)
            .pipe(catchError(this.handleError));
    }
    editUserInfo(data) {
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        headers = headers.append('Authorization', this.token);
        let options = { headers: headers };
        return this.http.post('http://localhost:3000/api/user/edit', data, options)
            .pipe(tap((data) => {
            if (data.user)
                this.currentUser = data.user;
        }), catchError(this.handleError));
    }
    deleteCoverPhoto(fileName) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.token);
        let url = 'http://localhost:3000/api/user/file/' + fileName;
        return this.http.delete(url, { headers: headers })
            .pipe(map((res) => {
            let data = res.deleted;
            return data;
        }), catchError(this.handleError));
    }
    getAllTeams(league) {
        let headers = new HttpHeaders();
        headers = headers.append('Authorization', this.token);
        let options = { headers: headers };
        return this.http.get('http://localhost:3000/api/teams?league=' + league, options)
            .pipe(catchError(this.handleError));
    }
    getFollowers(skip, user) {
        let headers = new HttpHeaders();
        headers = headers.append('Authorization', this.token);
        return this.http.get("http://localhost:3000/api/user/followers/" + user + "?skip=" + skip, { headers: headers })
            .pipe(catchError(this.handleError));
    }
    getFollowing(skip, user) {
        let headers = new HttpHeaders();
        headers = headers.append('Authorization', this.token);
        return this.http.get("http://localhost:3000/api/user/following/" + user + "?skip=" + skip, { headers: headers })
            .pipe(catchError(this.handleError));
    }
    checkAuthenticationStatusForGuard() {
        if (isPlatformBrowser(this.platformId)) {
            var value = localStorage.getItem('token');
            if (!!value) {
                this.token = value;
                let headers = new HttpHeaders();
                headers = headers.append('Content-Type', 'application/json');
                headers = headers.append('Authorization', this.token);
                return this.http.get('http://localhost:3000/api/user/session', { headers: headers })
                    .pipe(map((res) => {
                    const data = res.json();
                    if (data.user) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }), catchError(this.handleError));
            }
            else {
                of(false);
            }
        }
    }
    forgot(data) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        return this.http.post('http://localhost:3000/api/user/forgot', data, { headers })
            .pipe(catchError(this.handleError));
    }
    getReset(token) {
        return this.http.get("http://localhost:3000/api/user/reset/" + token)
            .pipe(catchError(this.handleError));
    }
    postReset(data, token) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        return this.http.post('http://localhost:3000/api/user/reset/' + token, data, { headers })
            .pipe(tap((data) => {
            if (data.user)
                this.currentUser = data.user;
        }), catchError(this.handleError));
    }
    updateTeams(data) {
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        headers = headers.append('Authorization', this.token);
        return this.http.put("http://localhost:3000/api/teams/update-user-teams", data, { headers: headers })
            .pipe(catchError(this.handleError));
    }
    logOut() {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('token', '');
            localStorage.setItem('user', '');
            this.currentUser = null;
        }
    }
    getOtherUserThreads(league, skip, user, leagues) {
        return this.http.get("http://localhost:3000/api/user/other-user-threads?skip=" + skip + "&user=" + user + "&league=" + league + '&leagues=' + JSON.stringify(leagues))
            .pipe(catchError(this.handleError));
    }
    saveLeagues(data) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.token);
        return this.http.post('http://localhost:3000/api/user/save-leagues', data, { headers: headers })
            .pipe(catchError(this.handleError));
    }
    getOtherUserTakes(league, skip, user, leagues) {
        return this.http.get("http://localhost:3000/api/user/other-user-takes?skip=" + skip + "&user=" + user + "&league=" + league + '&leagues=' + JSON.stringify(leagues))
            .pipe(catchError(this.handleError));
    }
    follow(id) {
        let headers = new HttpHeaders();
        headers = headers.append('Authorization', this.token);
        return this.http.put("http://localhost:3000/api/user/follow/" + id, {}, { headers: headers })
            .pipe(catchError(this.handleError));
    }
    unfollow(id) {
        let headers = new HttpHeaders();
        headers = headers.append('Authorization', this.token);
        return this.http.put("http://localhost:3000/api/user/unfollow/" + id, {}, { headers: headers })
            .pipe(catchError(this.handleError));
    }
    getUser(id) {
        let headers = new HttpHeaders();
        headers = headers.append('Authorization', this.token);
        return this.http.get("http://localhost:3000/api/user/user-fcm/" + id, { headers: headers })
            .pipe(catchError(this.handleError));
    }
    getUserByUsername(id) {
        return this.http.get("http://localhost:3000/api/user/user-fcm-username/" + id)
            .pipe(catchError(this.handleError));
    }
    getUserByUsernameUniversal(id) {
        return this.http.get("http://localhost:3000/api/user/user-fcm-username/" + id)
            .pipe(catchError(this.handleError));
    }
    getUserThreadDiscussions(skip) {
        let headers = new HttpHeaders();
        headers = headers.append('Authorization', this.token);
        return this.http.get("http://localhost:3000/api/user/thread-discussions?skip=" + skip, { headers: headers })
            .pipe(catchError(this.handleError));
    }
    getUserThreadAnswers(skip) {
        let headers = new HttpHeaders();
        headers = headers.append('Authorization', this.token);
        return this.http.get("http://localhost:3000/api/user/thread-answers?skip=" + skip, { headers: headers })
            .pipe(catchError(this.handleError));
    }
    randomString(length) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
    uploadFile(signedRequest, file) {
        return this.http.put(signedRequest, file)
            .pipe(catchError(this.handleError));
    }
    isLoggedIn() {
        return !!this.currentUser;
    }
    getProfile(skip) {
        let headers = new HttpHeaders();
        headers = headers.append('Authorization', this.token);
        return this.http.get("http://localhost:3000/api/user/profile?skip=" + skip, { headers: headers })
            .pipe(catchError(this.handleError));
    }
    searchUsers(searchTerm, skip) {
        let headers = new HttpHeaders();
        headers = headers.append('Authorization', this.token);
        return this.http.get("http://localhost:3000/api/user/search/" + searchTerm + "?skip=" + skip, { headers: headers })
            .pipe(catchError(this.handleError));
    }
    searchUsersLoggedOut(searchTerm, skip) {
        return this.http.get("http://localhost:3000/api/user/search-logged-out/" + searchTerm + "?skip=" + skip)
            .pipe(catchError(this.handleError));
    }
    consfigureLeagues() {
    }
    checkAuthentication() {
        if (isPlatformBrowser(this.platformId)) {
            //Load token if exists
            var value = localStorage.getItem('token');
            if (!!value) {
                this.token = value;
                let headers = new HttpHeaders();
                headers = headers.append('Authorization', this.token);
                return this.http.get('http://localhost:3000/api/user/session', { headers: headers })
                    .pipe(map((res) => {
                    const data = res;
                    return data.user;
                }), tap(currentUser => {
                    if (!!currentUser && isPlatformBrowser(this.platformId)) {
                        if (currentUser.blocked) {
                            localStorage.setItem('blocked', '1');
                            this.logOut();
                            alert(`You have been blocked from Discuss TheGame. \nReason: ${currentUser.blockedReason}`);
                        }
                        if (this.currentUser) {
                            if (currentUser.badge.level > this.currentUser.badge.level) {
                                setTimeout(() => {
                                    this.leveledUp = true;
                                }, 1000);
                            }
                        }
                        localStorage.setItem('user', JSON.stringify(currentUser));
                        this.currentUser = currentUser;
                        this.notifications = this.currentUser.notifications.filter(n => n != "message").length;
                        if (this.notifications > 0) {
                            this.seoService.setTitle(this.titleService.getTitle(), this.notifications);
                        }
                        this.webSocketService.connection();
                        this.webSocketService.updateConnection('online', this.currentUser._id);
                        this.webSocketService.loggedIn(this.currentUser._id);
                        this.disconnection = this.webSocketService.onDisconnection().subscribe(reason => {
                            if (reason === 'io server disconnect' || reason === 'transport close') {
                                // the disconnection was initiated by the server, you need to reconnect manually
                                this.webSocketService.connection();
                            }
                        });
                        this.ioConnection = this.webSocketService.onConnection().subscribe(() => {
                            this.webSocketService.updateConnection('online', this.currentUser._id);
                            this.webSocketService.loggedIn(this.currentUser._id);
                        });
                        this.connection = this.webSocketService.onNotifications().subscribe(post => {
                            this.currentUser.notifications.push(post);
                            this.notifications = this.currentUser.notifications.filter(n => n != "message").length;
                            if (this.notifications > 0) {
                                this.seoService.setTitle(this.titleService.getTitle(), this.notifications);
                            }
                        });
                    }
                }), catchError(this.handleError))
                    .subscribe();
            }
            else {
            }
        }
    }
    signup(user) {
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        let options = { headers: headers };
        return this.http.post('http://localhost:3000/api/user/signup', user, options)
            .pipe(tap((data) => {
            if (data.user && isPlatformBrowser(this.platformId)) {
                this.currentUser = data.user;
                this.token = data.token;
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                this.notifications = this.currentUser.notifications.filter(n => n != "message").length;
                this.webSocketService.connection();
                this.webSocketService.updateConnection('online', this.currentUser._id);
                this.webSocketService.loggedIn(this.currentUser._id);
                this.disconnection = this.webSocketService.onDisconnection().subscribe(reason => {
                    if (reason === 'io server disconnect' || reason === 'transport close') {
                        // the disconnection was initiated by the server, you need to reconnect manually
                        this.webSocketService.connection();
                    }
                });
                this.ioConnection = this.webSocketService.onConnection().subscribe(() => {
                    this.webSocketService.updateConnection('online', this.currentUser._id);
                    this.webSocketService.loggedIn(this.currentUser._id);
                });
                this.connection = this.webSocketService.onNotifications().subscribe(post => {
                    this.currentUser.notifications.push(post);
                    this.notifications = this.currentUser.notifications.filter(n => n != "message").length;
                    if (this.notifications > 0) {
                        this.seoService.setTitle(this.titleService.getTitle(), this.notifications);
                    }
                });
            }
        }), catchError(this.handleError));
    }
    login(user) {
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        let options = { headers: headers };
        return this.http.post('http://localhost:3000/api/user/login', user, options)
            .pipe(tap((data) => {
            if (data.blocked && isPlatformBrowser(this.platformId)) {
                alert(`You have been blocked from Discuss TheGame. \nReason: ${data.blockedReason}`);
            }
            else if (data.user && isPlatformBrowser(this.platformId)) {
                this.currentUser = data.user;
                this.token = data.token;
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                this.notifications = this.currentUser.notifications.filter(n => n != "message").length;
                this.webSocketService.connection();
                this.webSocketService.updateConnection('online', this.currentUser._id);
                this.webSocketService.loggedIn(this.currentUser._id);
                this.disconnection = this.webSocketService.onDisconnection().subscribe(reason => {
                    if (reason === 'io server disconnect' || reason === 'transport close') {
                        // the disconnection was initiated by the server, you need to reconnect manually
                        this.webSocketService.connection();
                    }
                });
                this.ioConnection = this.webSocketService.onConnection().subscribe(() => {
                    this.webSocketService.updateConnection('online', this.currentUser._id);
                    this.webSocketService.loggedIn(this.currentUser._id);
                });
                this.connection = this.webSocketService.onNotifications().subscribe(post => {
                    this.currentUser.notifications.push(post);
                    this.notifications = this.currentUser.notifications.filter(n => n != "message").length;
                    if (this.notifications > 0) {
                        this.seoService.setTitle(this.titleService.getTitle(), this.notifications);
                    }
                });
            }
        }), catchError(this.handleError));
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
__decorate([
    Cacheable({
        maxAge: 600000 //10 min
    })
], AuthService.prototype, "getUserByUsername", null);
AuthService = __decorate([
    Injectable({
        providedIn: 'root'
    }),
    __param(4, Inject(PLATFORM_ID))
], AuthService);
export { AuthService };
//# sourceMappingURL=auth.service.js.map