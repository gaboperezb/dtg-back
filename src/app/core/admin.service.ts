import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpResponse, } from '@angular/common/http';
//Grab everything with import 'rxjs/Rx';
import { Observable, of, throwError } from 'rxjs';
import {map, catchError, tap} from 'rxjs/operators'
import { AuthService } from './auth.service';


@Injectable({
    providedIn: 'root'
})
export class AdminService {

    baseTeamUrl: string = 'https://www.discussthegame.com/api/admin/teams';
    baseTriviaUrl: string = 'https://www.discussthegame.com/api/admin/trivias';
    baseUsersUrl: string = 'https://www.discussthegame.com/api/admin/users';
    baseGameUrl: string = 'https://www.discussthegame.com/api/admin/games';
    baseBadgeUrl: string = 'https://www.discussthegame.com/api/admin/badges';
    basePollUrl: string = 'https://www.discussthegame.com/api/admin/polls';
    baseReportUrl: string = 'https://www.discussthegame.com/api/admin/reports';
    basUserPostsUrl: string = 'https://www.discussthegame.com/api/admin/posts';
    basUserDiscussionsUrl: string = 'https://www.discussthegame.com/api/admin/discussions';
    basUserRepliesUrl: string = 'https://www.discussthegame.com/api/admin/replies';


    constructor(private http: HttpClient, private authService: AuthService) { }

    deleteGame(data:any) {

        let headers = new HttpHeaders();
            headers = headers.append('Content-Type', 'application/json');
            headers = headers.append('Authorization', this.authService.token);
   
        return this.http.post(this.baseGameUrl + "/i/delete-game", data, {headers})
                        .pipe(
                            map((res:any) => {
                            
                            let data = res.succeded;
                            return data;
                        }),
                        catchError(this.handleError));

    }

    addTeam(data:any) {
        let headers = new HttpHeaders();
            headers = headers.append('Content-Type', 'application/json');
            headers = headers.append('Authorization', this.authService.token);
      
        return this.http.post(this.baseTeamUrl, data, {headers})
                        .pipe(
                        catchError(this.handleError));
    }

    getTrivias(skip: number) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        return this.http.get(this.baseTriviaUrl + '?skip=' + skip, {headers})
                        .pipe(
                        catchError(this.handleError));
    }

    updateTrivia(data:any, triviaId:string) {
        
       
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        return this.http.put(this.baseTriviaUrl + "/" + triviaId, data, {headers})
                        .pipe(catchError(this.handleError));


    }

    addTrivia(data:any) {
        let headers = new HttpHeaders();
            headers = headers.append('Content-Type', 'application/json');
            headers = headers.append('Authorization', this.authService.token);
      
        return this.http.post(this.baseTriviaUrl, data, {headers})
                        .pipe(
                        catchError(this.handleError));
    }


    addGame(data:any) {
        let headers = new HttpHeaders();
            headers = headers.append('Content-Type', 'application/json');
            headers = headers.append('Authorization', this.authService.token);
        return this.http.post(this.baseGameUrl, data, {headers})
                        .pipe(
                            
                        catchError(this.handleError));
    }


    addBadge(data:any) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        return this.http.post(this.baseBadgeUrl, data, {headers})
                        .pipe(
                        catchError(this.handleError))
    }

    getBadges() {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        return this.http.get(this.baseBadgeUrl, {headers})
                        .pipe(
                        catchError(this.handleError));
    }

    getUsers(data: any) {
        let username = data.username;
        let headers = new HttpHeaders();
            headers = headers.append('Content-Type', 'application/json');
            headers = headers.append('Authorization', this.authService.token);
        return this.http.get(this.baseUsersUrl + "/" + username , {headers})
                        .pipe(
                        catchError(this.handleError));
    }

    getReports() {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        return this.http.get(this.baseReportUrl, {headers})
                        .pipe(
                        catchError(this.handleError))
    }

    updateBadge(data:any, badgeId:string) {

        let headers = new HttpHeaders();
            headers = headers.append('Content-Type', 'application/json');
            headers = headers.append('Authorization', this.authService.token);
        return this.http.put(this.baseBadgeUrl + "/" + badgeId, data, {headers})
                        .pipe(catchError(this.handleError));


    }

    updateReport(data:any, reportId:string) {

        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
    
        return this.http.put(this.baseReportUrl + "/" + reportId, data, {headers})
                        .pipe(catchError(this.handleError));

    }


    blockUserAccount(data:any) {

        let headers = new HttpHeaders();
            headers = headers.append('Content-Type', 'application/json');
            headers = headers.append('Authorization', this.authService.token);
        return this.http.put(this.baseUsersUrl + "/" + data.id, data, {headers})
                        .pipe(catchError(this.handleError))


    }




    getTeams() {
        let headers = new HttpHeaders();
   
        headers = headers.append('Authorization', this.authService.token);
        return this.http.get(this.baseTeamUrl, {headers})
                        .pipe(
                        catchError(this.handleError));
    }

    getUserPosts(user: string, skip: number) {
        let headers = new HttpHeaders();
        headers = headers.append('Authorization', this.authService.token);
        return this.http.get(this.basUserPostsUrl +  "/" + user + '?skip=' + skip, {headers})
                        .pipe(
                           
                        catchError(this.handleError))
    }

    getUserDiscussions(user: string, skip: number) {
        let headers = new HttpHeaders();
          
            headers = headers.append('Authorization', this.authService.token);
        return this.http.get(this.basUserDiscussionsUrl +  "/" + user + '?skip=' + skip, {headers})
                        .pipe(
                        catchError(this.handleError));
    }

    getUserReplies(user: string, skip: number) {
        let headers = new HttpHeaders();
            headers = headers.append('Content-Type', 'application/json');
            headers = headers.append('Authorization', this.authService.token);
            
        return this.http.get(this.basUserRepliesUrl +  "/" + user + '?skip=' + skip, {headers})
                        .pipe(
                        catchError(this.handleError));
    }

    

    getGames(skip:number, league:string) {
        let headers = new HttpHeaders();
  
        headers = headers.append('Authorization', this.authService.token);
        return this.http.get(this.baseGameUrl + "?skip=" + skip + "&league=" + league, {headers})
                        .pipe(
                        catchError(this.handleError));
    }

    updateTeam(data:any, teamId:string) {
        
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        return this.http.put(this.baseTeamUrl + "/" + teamId, data, {headers})
                        .pipe(catchError(this.handleError));


    }

    updateGame(data:any, gameId:string) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
    
        return this.http.put(this.baseGameUrl + "/" + gameId, data, {headers})
                        .pipe(catchError(this.handleError))


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


