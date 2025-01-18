import { Injectable, ɵConsole, Inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, } from '@angular/common/http';
//Grab everything with import 'rxjs/Rx';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators'
import { IUser } from '../shared/interfaces';
import { WebSocketService } from './websocket.service';
import { Title } from '@angular/platform-browser';
import { Cacheable } from 'ngx-cacheable';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { SeoSocialShareService } from './seo-social-share.service';


@Injectable({
    providedIn: 'root'
})
export class AuthService {




    currentUser: any;
    public token: any;
    postsActive: boolean;
    toggleAccess: boolean = false;
    toggleLogin: boolean = false;
    errorMessage: string = "";
    successMessage: string = "";
    paramSignUp: any;
    disableTabs: boolean = true; //para que no le piquen muy rapido
    redirectUrl: string;
    gettingAnswers: boolean = false;
    toggleUsername: boolean = false;
    accessTokenFB: string;
    accessTokenG: string;
    google: boolean = false;
    facebook: boolean = false;
    connection: any;
    ioConnection: any;
    disconnection: any;
    connectionM: any;
    wifi: boolean = false;
    showAddComment: boolean = true;
    notifications: number = 0;
    public downloadProfile: boolean = true;
    public downloadNotifications: boolean = true;
    showLikeHelp: boolean = false;
    permissionForNotifications: boolean;
    leveledUp: boolean = false;
    initialTimeSpent: number = Date.now();
    visibleNotifications: any[] = []; //Para el componente de notifications
    noScroll: boolean = false;
    scroll: boolean = false;
    observableTabOne: any;
    addurl: boolean = true;
    followInfo: boolean = false;
    levelsInfo: boolean = false;
    scrollTo: string; //timeline-detail
    stickyHeight: any;
    teams: boolean = false;
    chooseLeagues: boolean = false;
    register: boolean = false;

    userIdToDownload: string = "";

    constructor(private http: HttpClient, private seoService: SeoSocialShareService, private webSocketService: WebSocketService, private titleService: Title, @Inject(PLATFORM_ID) private platformId: Object) {


        if (isPlatformBrowser(this.platformId)) {
            var val = localStorage.getItem('user')
    
            if (!!val && typeof val !== "object" && val !== "[object Object]") {
                this.currentUser = JSON.parse(val);
                if (!this.currentUser.leagues.length) this.chooseLeagues = true;
            }
        }

    }


    getSignedRequest(fileName: string, fileType: string) {
        let headers = new HttpHeaders();
        headers = headers.append('Authorization', this.token);
        let url = `https://www.discussthegame.com/api/user/sign-s3?file-name=${fileName}&file-type=${fileType}`;
        return this.http.get(url, { headers: headers })
            .pipe(

                catchError(this.handleError));

    }

    unblockUser(user: string) {
        let data = {
            user
        }
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        headers = headers.append('Authorization', this.token);
        return this.http.post("https://www.discussthegame.com/api/user/unblock", data, { headers: headers })
            .pipe(

                catchError(this.handleError));
    }

    blockUser(user: string) {
        let data = {
            user
        }
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        headers = headers.append('Authorization', this.token);
        return this.http.post("https://www.discussthegame.com/api/user/block", data, { headers: headers })
            .pipe(

                catchError(this.handleError));
    }

    reportUser(user: string, reason: string, chat?: string) {
        let data = {
            user,
            reason,
            chat
        }
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        headers = headers.append('Authorization', this.token);
        return this.http.post("https://www.discussthegame.com/api/user/report", data, { headers: headers })
            .pipe(

                catchError(this.handleError));
    }

    getNotis() {

        let headers = new HttpHeaders();
        headers = headers.append('Authorization', this.token);
        return this.http.get('https://www.discussthegame.com/api/user/notis', { headers: headers })
            .pipe(

                catchError(this.handleError));

    }

    clearNotifications(newNotifications: number, type: string) {

        let data = {
            newNotifications,
            type
        }
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.token);
        let options = { headers: headers }
        return this.http.put('https://www.discussthegame.com/api/user/clear-notifications', data, options)
            .pipe(catchError(this.handleError));
    }

    deleteProfilePicture(fileName: string, fileNameThumbnail: string) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.token);
        let url = 'https://www.discussthegame.com/api/user/files/' + fileName + '/' + fileNameThumbnail;

        return this.http.delete(url, { headers: headers })
            .pipe(
                map((res: any) => {
                    let data = res.deleted;
                    return data;
                }),
                catchError(this.handleError));
    }

    changePassword(data: any) {
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        headers = headers.append('Authorization', this.token);
        let options = { headers: headers }
        return this.http.post('https://www.discussthegame.com/api/user/change-password', data, options)
            .pipe(

                catchError(this.handleError));


    }

    editUserInfo(data: any) {
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        headers = headers.append('Authorization', this.token);
        let options = { headers: headers }
        return this.http.post('https://www.discussthegame.com/api/user/edit', data, options)
            .pipe(
                tap((data: any) => {
                    if (data.user) this.currentUser = data.user;
                }),
                catchError(this.handleError));


    }


    deleteCoverPhoto(fileName: string) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.token);
        let url = 'https://www.discussthegame.com/api/user/file/' + fileName;

        return this.http.delete(url, { headers: headers })
            .pipe(
                map((res: any) => {
                    let data = res.deleted;
                    return data;
                }),
                catchError(this.handleError));
    }


    getAllTeams(league: string) {

        let headers = new HttpHeaders();
        headers = headers.append('Authorization', this.token);
        let options = { headers: headers }
        return this.http.get('https://www.discussthegame.com/api/teams?league=' + league, options)
            .pipe(
                catchError(this.handleError))

    }

    getFollowers(skip: number, user: string) {
        let headers = new HttpHeaders();
        headers = headers.append('Authorization', this.token);
        return this.http.get("https://www.discussthegame.com/api/user/followers/" + user + "?skip=" + skip, { headers: headers })
            .pipe(

                catchError(this.handleError));

    }

    getFollowing(skip: number, user: string) {
        let headers = new HttpHeaders();
        headers = headers.append('Authorization', this.token);
        return this.http.get("https://www.discussthegame.com/api/user/following/" + user + "?skip=" + skip, { headers: headers })
            .pipe(

                catchError(this.handleError));

    }

    checkAuthenticationStatusForGuard() {

        if (isPlatformBrowser(this.platformId)) {
            var value = localStorage.getItem('token')
            if (!!value) {
                this.token = value;
                let headers = new HttpHeaders();
                headers = headers.append('Content-Type', 'application/json');
                headers = headers.append('Authorization', this.token);
                return this.http.get('https://www.discussthegame.com/api/user/session', { headers: headers })
                    .pipe(
                        map((res: any) => {
                            if (res.user) {
                                return true;
                            } else { return false }


                        }),
                        catchError(this.handleError))


            } else {
                of(false);
            }
        }

    }

    forgot(data: any) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        return this.http.post('https://www.discussthegame.com/api/user/forgot', data, { headers })
            .pipe(
                catchError(this.handleError));
    }

    getReset(token: string) {
        return this.http.get("https://www.discussthegame.com/api/user/reset/" + token)
            .pipe(
                catchError(this.handleError));


    }

    postReset(data: any, token: any) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');

        return this.http.post('https://www.discussthegame.com/api/user/reset/' + token, data, { headers })
            .pipe(
                tap((data: any) => {
                    if (data.user) this.currentUser = data.user;

                }),
                catchError(this.handleError));

    }

    updateTeams(data: any) {

        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        headers = headers.append('Authorization', this.token);
        return this.http.put("https://www.discussthegame.com/api/teams/update-user-teams", data, { headers: headers })
            .pipe(
                catchError(this.handleError));
    }


    logOut() {

        if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('token', '');
            localStorage.setItem('user', '');
            this.currentUser = null;
        }
        
    }

    getOtherUserThreads(league: string, skip: number, user: string, leagues: string[]) {
        return this.http.get("https://www.discussthegame.com/api/user/other-user-threads?skip=" + skip + "&user=" + user + "&league=" + league + '&leagues=' + JSON.stringify(leagues))
            .pipe(

                catchError(this.handleError));
    }

    saveLeagues(data) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.token);

        return this.http.post('https://www.discussthegame.com/api/user/save-leagues', data, { headers: headers })
            .pipe(

                catchError(this.handleError));
    }

    getOtherUserTakes(league: string, skip: number, user: string, leagues: string[]) {
        return this.http.get("https://www.discussthegame.com/api/user/other-user-takes?skip=" + skip + "&user=" + user + "&league=" + league + '&leagues=' + JSON.stringify(leagues))
            .pipe(

                catchError(this.handleError));
    }

    follow(id: any) {
        let headers = new HttpHeaders();
        headers = headers.append('Authorization', this.token);
        return this.http.put("https://www.discussthegame.com/api/user/follow/" + id, {}, { headers: headers })
            .pipe(

                catchError(this.handleError));
    }

    unfollow(id: any) {
        let headers = new HttpHeaders();
        headers = headers.append('Authorization', this.token);
        return this.http.put("https://www.discussthegame.com/api/user/unfollow/" + id, {}, { headers: headers })
            .pipe(

                catchError(this.handleError));
    }


    getUser(id: string) {
        let headers = new HttpHeaders();
        headers = headers.append('Authorization', this.token);
        return this.http.get("https://www.discussthegame.com/api/user/user-fcm/" + id, { headers: headers })
            .pipe(

                catchError(this.handleError));
    }

    @Cacheable({
        maxAge: 600000 //10 min
    })
    getUserByUsername(id: string) {

        return this.http.get("https://www.discussthegame.com/api/user/user-fcm-username/" + id)
            .pipe(

                catchError(this.handleError));
    }

    getUserByUsernameUniversal(id: string) {

        return this.http.get("https://www.discussthegame.com/api/user/user-fcm-username/" + id)
            .pipe(

                catchError(this.handleError));
    }

    getUserThreadDiscussions(skip: number) {
        let headers = new HttpHeaders();
        headers = headers.append('Authorization', this.token);
        return this.http.get("https://www.discussthegame.com/api/user/thread-discussions?skip=" + skip, { headers: headers })
            .pipe(

                catchError(this.handleError));

    }

    getUserThreadAnswers(skip: number) {
        let headers = new HttpHeaders();
        headers = headers.append('Authorization', this.token);
        return this.http.get("https://www.discussthegame.com/api/user/thread-answers?skip=" + skip, { headers: headers })
            .pipe(

                catchError(this.handleError));

    }


    randomString(length: number) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    uploadFile(signedRequest: string, file: any) {
        return this.http.put(signedRequest, file)
            .pipe(
                catchError(this.handleError))
    }

    isLoggedIn(): boolean {
        return !!this.currentUser;
    }

    getProfile(skip: number) {
        let headers = new HttpHeaders();
        headers = headers.append('Authorization', this.token);
        return this.http.get("https://www.discussthegame.com/api/user/profile?skip=" + skip, { headers: headers })
            .pipe(

                catchError(this.handleError));

    }

    searchUsers(searchTerm: string, skip: number) {


        let headers = new HttpHeaders();
        headers = headers.append('Authorization', this.token);
        return this.http.get("https://www.discussthegame.com/api/user/search/" + searchTerm + "?skip=" + skip, { headers: headers })
            .pipe(
                catchError(this.handleError));

    }


    searchUsersLoggedOut(searchTerm: string, skip: number) {


        return this.http.get("https://www.discussthegame.com/api/user/search-logged-out/" + searchTerm + "?skip=" + skip)
            .pipe(
                catchError(this.handleError));

    }

    consfigureLeagues() {

    }


    checkAuthentication() {

        if (isPlatformBrowser(this.platformId)) {
            //Load token if exists
            var value = localStorage.getItem('token')
         

            if (!!value) {
                this.token = value;
                let headers = new HttpHeaders();
                headers = headers.append('Authorization', this.token);
                return this.http.get('https://www.discussthegame.com/api/user/session', { headers: headers })
                    .pipe(
                        map((res: any) => {
                            const data = res;
                            return data.user;
                        }),
                        tap(currentUser => {

                            if (!!currentUser && isPlatformBrowser(this.platformId)) {


                                if (currentUser.blocked) {

                                    localStorage.setItem('blocked', '1');
                                    this.logOut();
                                    alert(`You have been blocked from Discuss the Game. \nReason: ${currentUser.blockedReason}`);

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
                                this.webSocketService.loggedIn(this.currentUser._id)

                                this.disconnection = this.webSocketService.onDisconnection().subscribe(reason => {
                                    if (reason === 'io server disconnect' || reason === 'transport close') {
                                        // the disconnection was initiated by the server, you need to reconnect manually
                                        this.webSocketService.connection();
                                    }

                                })
                                this.ioConnection = this.webSocketService.onConnection().subscribe(() => {
                                    this.webSocketService.updateConnection('online', this.currentUser._id);
                                    this.webSocketService.loggedIn(this.currentUser._id);
                                })

                                this.connection = this.webSocketService.onNotifications().subscribe(post => {

                                    this.currentUser.notifications.push(post);
                                    this.notifications = this.currentUser.notifications.filter(n => n != "message").length;
                                    if (this.notifications > 0) {
                                        this.seoService.setTitle(this.titleService.getTitle(), this.notifications);
                                    }

                                })

                            }

                        }),
                        catchError(this.handleError))
                    .subscribe();

            } else {

            }
        }



    }

    signup(user: IUser) {
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        let options = { headers: headers }
        return this.http.post('https://www.discussthegame.com/api/user/signup', user, options)
            .pipe(

                tap((data: any) => {
                    if (data.user && isPlatformBrowser(this.platformId)) {

                        this.currentUser = data.user;
                        this.token = data.token;
                        localStorage.setItem('token', data.token);
                        localStorage.setItem('user', JSON.stringify(data.user));

                        this.notifications = this.currentUser.notifications.filter(n => n != "message").length;



                        this.webSocketService.connection();
                        this.webSocketService.updateConnection('online', this.currentUser._id);
                        this.webSocketService.loggedIn(this.currentUser._id)

                        this.disconnection = this.webSocketService.onDisconnection().subscribe(reason => {
                            if (reason === 'io server disconnect' || reason === 'transport close') {
                                // the disconnection was initiated by the server, you need to reconnect manually
                                this.webSocketService.connection();

                            }

                        })
                        this.ioConnection = this.webSocketService.onConnection().subscribe(() => {

                            this.webSocketService.updateConnection('online', this.currentUser._id);
                            this.webSocketService.loggedIn(this.currentUser._id);

                        })
                        this.connection = this.webSocketService.onNotifications().subscribe(post => {
                            this.currentUser.notifications.push(post);
                            this.notifications = this.currentUser.notifications.filter(n => n != "message").length;
                            if (this.notifications > 0) {
                                this.seoService.setTitle(this.titleService.getTitle(), this.notifications);
                            }

                        })


                    }
                }),
                catchError(this.handleError));

    }

    login(user: any) {
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        let options = { headers: headers }
        return this.http.post('https://www.discussthegame.com/api/user/login', user, options)
            .pipe(

                tap((data: any) => {

                    if (data.blocked && isPlatformBrowser(this.platformId)) {
                        alert(`You have been blocked from Discuss the Game. \nReason: ${data.blockedReason}`)
                    } else if (data.user && isPlatformBrowser(this.platformId)) {
                        this.currentUser = data.user;
                        this.token = data.token;
                        localStorage.setItem('token', data.token);
                        localStorage.setItem('user', JSON.stringify(data.user));
                        this.notifications = this.currentUser.notifications.filter(n => n != "message").length;


                        this.webSocketService.connection();
                        this.webSocketService.updateConnection('online', this.currentUser._id);
                        this.webSocketService.loggedIn(this.currentUser._id)
                        this.disconnection = this.webSocketService.onDisconnection().subscribe(reason => {
                            if (reason === 'io server disconnect' || reason === 'transport close') {
                                // the disconnection was initiated by the server, you need to reconnect manually
                                this.webSocketService.connection();

                            }

                        })
                        this.ioConnection = this.webSocketService.onConnection().subscribe(() => {

                            this.webSocketService.updateConnection('online', this.currentUser._id);
                            this.webSocketService.loggedIn(this.currentUser._id);

                        })

                        this.connection = this.webSocketService.onNotifications().subscribe(post => {

                            this.currentUser.notifications.push(post);
                            this.notifications = this.currentUser.notifications.filter(n => n != "message").length;
                            if (this.notifications > 0) {
                                this.seoService.setTitle(this.titleService.getTitle(), this.notifications);
                            }
                        })

                    }

                }),
                catchError(this.handleError));

    }

    private handleError(error) {
        console.error('server error:', error);
        let errorMessage = 'Something went wrong';
        if (error instanceof HttpErrorResponse) {
            // client-side error
            errorMessage = `Something went wrong`;
        } else {
            // server-side error
            errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
        }
        return throwError(errorMessage);
    }


}


