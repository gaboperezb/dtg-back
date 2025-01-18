import { __decorate, __param } from "tslib";
import { Injectable, Inject } from '@angular/core';
import { HttpHeaders, HttpErrorResponse, } from '@angular/common/http';
//Grab everything with import 'rxjs/Rx';
import { throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Cacheable } from 'ngx-cacheable';
import { PLATFORM_ID } from '@angular/core';
let ThreadsService = class ThreadsService {
    constructor(http, authService, platformId) {
        this.http = http;
        this.authService = authService;
        this.platformId = platformId;
        this.baseUrl = 'http://localhost:3000/api/threads';
        this.baseLinksUrl = "/api/threads/i/links";
        this.basePollUrl = "http://localhost:3000/api/threads/i/poll";
        this.baseFeaturedUrl = "http://localhost:3000/api/threads/i/featured";
        this.baseAllFeaturedUrl = "http://localhost:3000/api/threads/i/all-featured";
        this.leagueToDownload = "TOP";
        this.loadingMore = false;
        this.transition = false;
        this.showInfiniteSpinner = false;
        this.leagues = [];
        this.posting = false;
        this.followers = false;
        this.hot = true;
        this.new = false;
        this.top = false;
        this.threads = [];
        this.featuredThreads = [];
        this.editUrl = '/tabs/tab1';
        this.baseTeamsUrl = "http://localhost:3000/api/threads/i/teams";
        this.baseSearchUrl = "http://localhost:3000/api/threads/i/search";
        this.postsToggled = true;
        this.menuLeagues = [
            {
                league: 'NBA',
                selected: false,
                image: "assets/imgs/nba.png"
            },
            {
                league: 'NFL',
                selected: false,
                image: "assets/imgs/nfl.png"
            },
            {
                league: 'Soccer',
                selected: false,
                image: "assets/imgs/soccer.png"
            },
            {
                league: 'MLB',
                selected: false,
                image: "assets/imgs/mlb.png"
            },
            {
                league: 'NHL',
                selected: false,
                image: "assets/imgs/nhl.png"
            },
            {
                league: 'NCAAF',
                selected: false,
                image: "assets/imgs/ncaaf.png"
            },
            {
                league: 'NCAAB',
                selected: false,
                image: "assets/imgs/ncaab.png"
            },
            {
                league: 'NFL Fantasy',
                selected: false,
                image: "assets/imgs/nfl-fantasy.png"
            },
            {
                league: 'MMA',
                selected: false,
                image: "assets/imgs/mma.png"
            },
            {
                league: 'Boxing',
                selected: false,
                image: "assets/imgs/boxing.png"
            },
            {
                league: 'Tennis',
                selected: false,
                image: "assets/imgs/tennis.png"
            },
            {
                league: 'Golf',
                selected: false,
                image: "assets/imgs/golf.png"
            },
            {
                league: 'Motorsports',
                selected: false,
                image: "assets/imgs/motorsports.png"
            },
            {
                league: 'General',
                selected: false,
                image: "assets/imgs/general.png"
            }
        ];
        this.nofollowing = false;
        this.placeholders = true;
        this.loaderActive = true; //ion-infinite
        this.hideInfinite = true;
        this.loadingFeatured = true;
        this.toggleRefresh = false;
        this.toggleFeaturedRefresh = false;
        this.filterBy = "TOP";
        this.skip = 0;
        this.skipNewest = 0;
        this.skipTop = 0;
        this.skipFollowers = 0;
        this.refreshThreads = [];
        this.refreshFeaturedThreads = [];
        this.scrolling = false;
    }
    edit(id, data) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        let options = { headers: headers };
        return this.http.post(this.baseUrl + '/' + id, data, options)
            .pipe(catchError(this.handleError));
    }
    deleteThread(data) {
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        headers = headers.append('Authorization', this.authService.token);
        let options = { headers: headers };
        return this.http.post(this.baseUrl + "/i/delete-post", data, options)
            .pipe(map((res) => {
            let data = res.succeded;
            return data;
        }), catchError(this.handleError));
    }
    deleteS3(fileName) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        let url = this.baseUrl + `/delete-s3?file-name=${fileName}`;
        return this.http.put(url, {}, { headers: headers })
            .pipe(catchError(this.handleError));
    }
    newThread(data) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        let options = { headers: headers };
        return this.http.post(this.baseUrl, data, options)
            .pipe(catchError(this.handleError));
    }
    newLinkThread(data) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        let options = { headers: headers };
        return this.http.post(this.baseUrl + "/i/link-thread", data, options)
            .pipe(catchError(this.handleError));
    }
    getSignedRequest(fileName, fileType) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        let url = this.baseUrl + `/sign-s3?file-name=${fileName}&file-type=${fileType}`;
        return this.http.get(url, { headers: headers })
            .pipe(catchError(this.handleError));
    }
    getSignedRequestFroala() {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        let url = this.baseUrl + `/sign-s3-froala`;
        return this.http.get(url, { headers: headers })
            .pipe(catchError(this.handleError));
    }
    //Tambien para daily poll
    userHasVoted(thread, userId) {
        return thread.votes.some((voter) => voter.user === userId);
    }
    //
    getFeatured(league, skip) {
        let userId = this.authService.isLoggedIn() ? this.authService.currentUser._id : '0';
        return this.http.get(this.baseFeaturedUrl + '?league=' + league + '&skip=' + skip + '&leagues=' + JSON.stringify(this.leagues) + '&userId=' + userId + '&limit=6')
            .pipe(catchError(this.handleError));
    }
    getFeaturedUniversal(league, skip) {
        let userId = this.authService.isLoggedIn() ? this.authService.currentUser._id : '0';
        return this.http.get(this.baseFeaturedUrl + '?league=' + league + '&skip=' + skip + '&leagues=' + JSON.stringify(this.leagues) + '&userId=' + userId + '&limit=6')
            .pipe(catchError(this.handleError));
    }
    getFeaturedForFeaturedPage(league, skip) {
        let userId = this.authService.isLoggedIn() ? this.authService.currentUser._id : '0';
        return this.http.get(this.baseAllFeaturedUrl + '?league=' + league + '&skip=' + skip + '&leagues=' + JSON.stringify(this.leagues) + '&userId=' + userId + '&limit=6')
            .pipe(catchError(this.handleError));
    }
    populateMenu() {
        let allleagues = [
            {
                league: 'NBA',
                selected: false,
                image: "assets/imgs/nba.png"
            },
            {
                league: 'NFL',
                selected: false,
                image: "assets/imgs/nfl.png"
            },
            {
                league: 'Soccer',
                selected: false,
                image: "assets/imgs/soccer.png"
            },
            {
                league: 'MLB',
                selected: false,
                image: "assets/imgs/mlb.png"
            },
            {
                league: 'NHL',
                selected: false,
                image: "assets/imgs/nhl.png"
            },
            {
                league: 'NCAAF',
                selected: false,
                image: "assets/imgs/ncaaf.png"
            },
            {
                league: 'NCAAB',
                selected: false,
                image: "assets/imgs/ncaab.png"
            },
            {
                league: 'NFL Fantasy',
                selected: false,
                image: "assets/imgs/nfl-fantasy.png"
            },
            {
                league: 'MMA',
                selected: false,
                image: "assets/imgs/mma.png"
            },
            {
                league: 'Boxing',
                selected: false,
                image: "assets/imgs/boxing.png"
            },
            {
                league: 'Tennis',
                selected: false,
                image: "assets/imgs/tennis.png"
            },
            {
                league: 'Golf',
                selected: false,
                image: "assets/imgs/golf.png"
            },
            {
                league: 'Motorsports',
                selected: false,
                image: "assets/imgs/motorsports.png"
            },
            {
                league: 'General',
                selected: false,
                image: "assets/imgs/general.png"
            }
        ];
        if (this.authService.isLoggedIn())
            this.leagues = this.authService.currentUser.leagues;
        else {
            this.leagues = allleagues.map(league => league.league);
        }
    }
    getTeamThreads(team, skip) {
        let headers = new HttpHeaders();
        headers = headers.append('Authorization', this.authService.token);
        return this.http.get(this.baseTeamsUrl + '?team=' + team + '&skip=' + skip + '&limit=8', { headers })
            .pipe(catchError(this.handleError));
    }
    searchThreads(search, skip) {
        return this.http.get(this.baseSearchUrl + '?search=' + search + '&skip=' + skip + '&limit=10')
            .pipe(catchError(this.handleError));
    }
    getThreads(league, skip) {
        let userId = this.authService.isLoggedIn() ? this.authService.currentUser._id : '0';
        return this.http.get(this.baseUrl + '?league=' + league + '&skip=' + skip + '&leagues=' + JSON.stringify(this.leagues) + '&userId=' + userId + '&limit=8')
            .pipe(catchError(this.handleError));
    }
    getThreadDB(id) {
        return this.http.get(this.baseUrl + '/' + id)
            .pipe(catchError(this.handleError));
    }
    getThreadDBUniversal(id) {
        return this.http.get(this.baseUrl + '/' + id)
            .pipe(catchError(this.handleError));
    }
    getThread(id) {
        return this.threads.find(thread => thread._id === id) || this.featuredThreads.find(thread => thread._id === id);
    }
    getFollowingThreads(league, skip) {
        let headers = new HttpHeaders();
        headers = headers.append('Authorization', this.authService.token);
        let options = { headers: headers };
        return this.http.get(this.baseUrl + '/following' + '?league=' + league + '&skip=' + skip + '&limit=8' + '&leagues=' + JSON.stringify(this.leagues), options)
            .pipe(catchError(this.handleError));
    }
    trackViews(id) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        let options = { headers: headers };
        let data;
        if (this.authService.isLoggedIn())
            data = { id: this.authService.currentUser._id };
        else {
            data = {
                id: null
            };
        }
        return this.http.put(this.baseUrl + '/' + id, data, options)
            .pipe(catchError(this.handleError))
            .subscribe();
    }
    getNewestThreads(league, skip) {
        let userId = this.authService.isLoggedIn() ? this.authService.currentUser._id : '0';
        return this.http.get(this.baseUrl + "/i/newest" + '?league=' + league + '&skip=' + skip + '&leagues=' + JSON.stringify(this.leagues) + '&userId=' + userId + '&limit=8')
            .pipe(catchError(this.handleError));
    }
    getTopThreads(league, skip) {
        let userId = this.authService.isLoggedIn() ? this.authService.currentUser._id : '0';
        return this.http.get(this.baseUrl + "/i/top" + '?league=' + league + '&skip=' + skip + '&leagues=' + JSON.stringify(this.leagues) + '&userId=' + userId + '&limit=8')
            .pipe(catchError(this.handleError));
    }
    postDaily(poll, option) {
        let body = {
            option: option,
            poll: poll
        };
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        let options = { headers: headers };
        let url = `${this.basePollUrl}/${poll._id}/vote`;
        return this.http.post(url, body, options)
            .pipe(catchError(this.handleError))
            .subscribe();
    }
    boost(thread, likes) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        let options = { headers: headers };
        let body = {
            likes
        };
        let url = `${this.baseUrl}/${thread}/boost`;
        return this.http.post(url, body, options)
            .pipe(catchError(this.handleError))
            .subscribe();
    }
    boostViews(thread, views) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        let options = { headers: headers };
        let body = {
            views
        };
        let url = `${this.baseUrl}/${thread}/boost-views`;
        return this.http.post(url, body, options)
            .pipe(catchError(this.handleError))
            .subscribe();
    }
    boostVotes(thread, numberOfVotes, option) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        let options = { headers: headers };
        let body = {
            numberOfVotes,
            option
        };
        let url = `${this.baseUrl}/${thread}/boost-votes`;
        return this.http.post(url, body, options)
            .pipe(catchError(this.handleError))
            .subscribe();
    }
    feature(thread) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        let options = { headers: headers };
        let url = `${this.baseUrl}/${thread}/feature`;
        return this.http.put(url, {}, options)
            .pipe(catchError(this.handleError));
    }
    postVote(thread, option) {
        //Para no quebrar antiguas versiones
        let newThread = {
            _id: thread._id
        };
        let body = {
            option: option,
            thread: newThread
        };
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        let options = { headers: headers };
        let url = `${this.baseUrl}/${thread._id}/vote`;
        return this.http.post(url, body, options)
            .pipe(catchError(this.handleError))
            .subscribe();
    }
    //Tambien para daily poll
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
__decorate([
    Cacheable({
        maxAge: 600000 //10 min
    })
], ThreadsService.prototype, "getFeatured", null);
__decorate([
    Cacheable({
        maxAge: 1.8e+6 //30 min
    })
], ThreadsService.prototype, "getThreadDB", null);
ThreadsService = __decorate([
    Injectable({
        providedIn: 'root'
    }),
    __param(2, Inject(PLATFORM_ID))
], ThreadsService);
export { ThreadsService };
//# sourceMappingURL=thread.service.js.map