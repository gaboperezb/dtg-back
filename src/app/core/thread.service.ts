import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, } from '@angular/common/http';
//Grab everything with import 'rxjs/Rx';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators'
import { AuthService } from './auth.service';
import { IThread, IPoll } from '../shared/interfaces';
import { Cacheable, ICacheHasher } from 'ngx-cacheable';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';


@Injectable({
    providedIn: 'root'
})
export class ThreadsService {

    baseUrl: string = 'https://www.discussthegame.com/api/threads';
    baseLinksUrl: string = "/api/threads/i/links"
    basePollUrl: string = "https://www.discussthegame.com/api/threads/i/poll"
    baseFeaturedUrl: string = "https://www.discussthegame.com/api/threads/i/featured"
    baseAllFeaturedUrl: string = "https://www.discussthegame.com/api/threads/i/all-featured"
    leagueToDownload: string = "TOP";
    loadingMore: boolean = false;
    transition: boolean = false;
    showInfiniteSpinner: boolean = false;
    leagues: string[] = [];
    posting: boolean = false;
    followers: boolean = false;
    hot: boolean = true;
    new: boolean = false;
    top: boolean = false;
    threadToEdit: any;
    bookmarks: boolean = false;
    draftInitial: any;
    threadToEditOriginal: any; //para editar y conservar la referencia

    threads: any[] = [];
    featuredThreads: any[] = [];
    threadUserPage: any;
    editUrl: string = '/tabs/tab1'

    //Directives
    scrollContent: any;
    fixed: any;
    baseTeamsUrl: string = "https://www.discussthegame.com/api/threads/i/teams"
    baseSearchUrl: string = "https://www.discussthegame.com/api/threads/i/search"
    postsToggled: boolean = true;
    menuLeagues = [
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
    nofollowing: boolean = false;
    placeholders: boolean = true;
    loaderActive: boolean = true; //ion-infinite
    hideInfinite: boolean = true;
    loadingFeatured: boolean = true;
    toggleRefresh: boolean = false;
    toggleFeaturedRefresh: boolean = false;

    filterBy: string = "TOP";

    skip: number = 0;
    skipNewest: number = 0;
    skipTop: number = 0;
    skipFollowers: number = 0;
    skipSaved: number = 0;


    refreshThreads: IThread[] = [];

    refreshFeaturedThreads: IThread[] = [];
    currentThread: IThread;





    scrolling: boolean = false;

    constructor(private http: HttpClient, public authService: AuthService, @Inject(PLATFORM_ID) private platformId: Object) {

    }


    addToBookmarks(thread: any) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        let options = {headers: headers};
        let url = `${this.baseUrl}/${thread}/bookmark`;
        return this.http.post(url, {}, options)
                        .pipe(catchError(this.handleError))
                        .subscribe();
    }

    deleteBookmark(thread: any) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        let options = {headers: headers};
        let url = `${this.baseUrl}/${thread}/bookmark`;
        return this.http.delete(url, options)
                        .pipe(catchError(this.handleError))
                        .subscribe();

    }

    getBookmarks(skip: number): Observable<any> {
        let headers = new HttpHeaders();
        headers = headers.append('Authorization', this.authService.token);
        return this.http.get(this.baseUrl + '/bookmarks?skip=' + skip, {headers})
                        .pipe(       
                        catchError(this.handleError));

    }

    edit(id: string, data) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        let options = { headers: headers };
        return this.http.post(this.baseUrl + '/' + id, data, options)
            .pipe(

                catchError(this.handleError));


    }

    deleteThread(data: any) {

        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        headers = headers.append('Authorization', this.authService.token);
        let options = { headers: headers };
        return this.http.post(this.baseUrl + "/i/delete-post", data, options)
            .pipe(
                map((res: any) => {
                    let data = res.succeded;
                    return data;
                }),
                catchError(this.handleError));

    }

    deleteS3(fileName: string) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        let url = this.baseUrl + `/delete-s3?file-name=${fileName}`;
        return this.http.put(url, {}, { headers: headers })
            .pipe(

                catchError(this.handleError));

    }

    newThread(data: any) {

        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        let options = { headers: headers };
        return this.http.post(this.baseUrl, data, options)
            .pipe(catchError(this.handleError));

    }

    newLinkThread(data: any) {

        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        let options = { headers: headers };
        return this.http.post(this.baseUrl + "/i/link-thread", data, options)
            .pipe(

                catchError(this.handleError));

    }

    getSignedRequest(fileName: string, fileType: string) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        let url = this.baseUrl + `/sign-s3?file-name=${fileName}&file-type=${fileType}`;
        return this.http.get(url, { headers: headers })
            .pipe(

                catchError(this.handleError));

    }

    getSignedRequestFroala() {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        let url = this.baseUrl + `/sign-s3-froala`;
        return this.http.get(url, { headers: headers })
            .pipe(
                catchError(this.handleError));

    }




    //Tambien para daily poll
    userHasVoted(thread: any, userId: string) {
        return thread.votes.some((voter: any) => voter.user === userId);
    }

    //
    @Cacheable({
        maxAge: 600000 //10 min
    })
    getFeatured(league: string, skip: number): Observable<any> {

        let userId = this.authService.isLoggedIn() ? this.authService.currentUser._id : '0';
        return this.http.get(this.baseFeaturedUrl + '?league=' + league + '&skip=' + skip + '&leagues=' + JSON.stringify(this.leagues) + '&userId=' + userId + '&limit=6')
            .pipe(

                catchError(this.handleError));
    }

    getFeaturedUniversal(league: string, skip: number): Observable<any> {

        let userId = this.authService.isLoggedIn() ? this.authService.currentUser._id : '0';
        return this.http.get(this.baseFeaturedUrl + '?league=' + league + '&skip=' + skip + '&leagues=' + JSON.stringify(this.leagues) + '&userId=' + userId + '&limit=6')
            .pipe(

                catchError(this.handleError));
    }

    getFeaturedForFeaturedPage(league: string, skip: number): Observable<any> {
        let userId = this.authService.isLoggedIn() ? this.authService.currentUser._id : '0';
        return this.http.get(this.baseAllFeaturedUrl + '?league=' + league + '&skip=' + skip + '&leagues=' + JSON.stringify(this.leagues) + '&userId=' + userId + '&limit=6')
            .pipe(

                catchError(this.handleError));

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
       
        if (this.authService.isLoggedIn()) {
            this.leagues = this.authService.currentUser.leagues;
           
        }
        else {
            this.leagues = allleagues.map(league => league.league);
         
        }
        
    }


    getTeamThreads(team: string, skip: number): Observable<any> {

        let headers = new HttpHeaders();
        headers = headers.append('Authorization', this.authService.token);
        return this.http.get(this.baseTeamsUrl + '?team=' + team + '&skip=' + skip + '&limit=8', { headers })
            .pipe(
                catchError(this.handleError));

    }

    searchThreads(search: string, skip: number): Observable<any> {


        return this.http.get(this.baseSearchUrl + '?search=' + search + '&skip=' + skip + '&limit=10')
            .pipe(
                catchError(this.handleError));

    }

    getThreads(league: string, skip: number): Observable<any> {
        let userId = this.authService.isLoggedIn() ? this.authService.currentUser._id : '0';

        return this.http.get(this.baseUrl + '?league=' + league + '&skip=' + skip + '&leagues=' + JSON.stringify(this.leagues) + '&userId=' + userId + '&limit=8')
            .pipe(

                catchError(this.handleError));
    }

    @Cacheable({
        maxAge: 1.8e+6 //30 min
    })
    getThreadDB(id: string): Observable<any> {

        return this.http.get(this.baseUrl + '/' + id)
            .pipe(

                catchError(this.handleError));

    }

    getThreadDBUniversal(id: string): Observable<any> {
        return this.http.get(this.baseUrl + '/' + id)
            .pipe(
                catchError(this.handleError));

    }

    getThread(id) {
        return this.threads.find(thread => thread._id === id) || this.featuredThreads.find(thread => thread._id === id);
    }

    getFollowingThreads(league: string, skip: number): Observable<any> {
        let headers = new HttpHeaders();
        headers = headers.append('Authorization', this.authService.token);
        let options = { headers: headers };
        return this.http.get(this.baseUrl + '/following' + '?league=' + league + '&skip=' + skip + '&limit=8' + '&leagues=' + JSON.stringify(this.leagues), options)
            .pipe(

                catchError(this.handleError));

    }
    

    trackViews(id: string) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        let options = { headers: headers };
        let data;
        if (this.authService.isLoggedIn()) data = { id: this.authService.currentUser._id };
        else {
            data = {
                id: null
            };
        }
        return this.http.put(this.baseUrl + '/' + id, data, options)
            .pipe(

                catchError(this.handleError))
            .subscribe();

    }

    getNewestThreads(league: string, skip: number): Observable<any> {

        let userId = this.authService.isLoggedIn() ? this.authService.currentUser._id : '0';
        return this.http.get(this.baseUrl + "/i/newest" + '?league=' + league + '&skip=' + skip + '&leagues=' + JSON.stringify(this.leagues) + '&userId=' + userId + '&limit=8')
            .pipe(

                catchError(this.handleError));

    }

    getTopThreads(league: string, skip: number): Observable<any> {
        let userId = this.authService.isLoggedIn() ? this.authService.currentUser._id : '0';
        return this.http.get(this.baseUrl + "/i/top" + '?league=' + league + '&skip=' + skip + '&leagues=' + JSON.stringify(this.leagues) + '&userId=' + userId + '&limit=8')
            .pipe(

                catchError(this.handleError));

    }


    postDaily(poll: IPoll, option: string) {

        let body = {
            option: option,
            poll: poll
        }

        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        let options = { headers: headers };
        let url = `${this.basePollUrl}/${poll._id}/vote`
        return this.http.post(url, body, options)
            .pipe(catchError(this.handleError))
            .subscribe();
    }


    boost(thread: any, likes: number) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        let options = { headers: headers };
        let body = {
            likes
        }
        let url = `${this.baseUrl}/${thread}/boost`;
        return this.http.post(url, body, options)
            .pipe(catchError(this.handleError))
            .subscribe();

    }

    boostViews(thread: any, views: number) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        let options = { headers: headers };
        let body = {
            views
        }
        let url = `${this.baseUrl}/${thread}/boost-views`;
        return this.http.post(url, body, options)
            .pipe(catchError(this.handleError))
            .subscribe();

    }

    boostVotes(thread: any, numberOfVotes: number, option?: string) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        let options = { headers: headers };
        let body = {
            numberOfVotes,
            option
        }
        let url = `${this.baseUrl}/${thread}/boost-votes`;
        return this.http.post(url, body, options)
            .pipe(catchError(this.handleError))
            .subscribe();

    }

    feature(thread: any) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        let options = { headers: headers };
        let url = `${this.baseUrl}/${thread}/feature`;
        return this.http.put(url, {}, options)
            .pipe(catchError(this.handleError))


    }




    postVote(thread: IThread, option: string) {

        //Para no quebrar antiguas versiones
        let newThread = {
            _id: thread._id
        }
        let body = {
            option: option,
            thread: newThread
        }
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        let options = { headers: headers };
        let url = `${this.baseUrl}/${thread._id}/vote`
        return this.http.post(url, body, options)
            .pipe(catchError(this.handleError))
            .subscribe();
    }


    //Tambien para daily poll


    private handleError(error) {
        console.error('server error:', error);
        let errorMessage = '';
        if (error instanceof HttpErrorResponse) {
            // client-side error
            errorMessage = 'Oops! Something went wrong';
        } else {
            // server-side error
            errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
        }
        return throwError(errorMessage);
    }



}