import { Component, OnInit, ViewChild } from '@angular/core';
import { PlayService } from '../../core/play.service';
import { ITrivia } from '../../shared/interfaces';
import { TakeService } from 'src/app/core/take.service';
import { ThreadsService } from 'src/app/core/thread.service';
import { AuthService } from 'src/app/core/auth.service';




@Component({
    selector: 'app-play',
    templateUrl: './play.component.html',
    styleUrls: ['./play.component.scss'],
})
export class PlayComponent implements OnInit {

    trivias: ITrivia[] = [];

    constructor(public playService: PlayService,
        private takeService: TakeService,
        private authService: AuthService,
        public threadsService: ThreadsService) { }

    ngOnInit() {

    }


    navbarGetPlayItems() {
    
        this.playService.toggleRefresh = false;
        this.takeService.toggleRefresh = false;
        this.threadsService.toggleRefresh = false;
        this.getPlayItems(this.threadsService.filterBy)

    }

    getPlayItems(league: string) {


        this.threadsService.filterBy = league;
        this.playService.loaderActive = true;
        this.playService.placeholders = true;
        this.playService.getDailyTrivias(league)
            .subscribe((trivias: any) => {

                this.playService.trivias = trivias
                this.playService.loaderActive = false;
                setTimeout(() => {
                    this.playService.placeholders = false;
                }, 1000);

                this.threadsService.hideInfinite = false;
                this.playService.toggleRefresh = false;
                this.threadsService.toggleRefresh = false;
                this.playService.toggleRefresh = false;

                let height = (this.playService.trivias.length * 80);
				this.authService.stickyHeight = {
					"height": height + 'px'
				}

            },
                (err) => {

                    this.playService.loaderActive = false;
                    this.playService.placeholders = false;
                    this.authService.errorMessage = err;
                    setTimeout(() => {
                        this.authService.errorMessage = null;
                    }, 5000);

                })

    }






}
