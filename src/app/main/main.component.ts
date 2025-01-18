import { Component, ViewChild, OnInit, HostListener, Inject } from '@angular/core';
import { TakeService } from '../core/take.service';
import { ThreadsService } from '../core/thread.service';
import { AuthService } from '../core/auth.service';
import { LikesService } from '../core/likers.service';
import { ThreadLikesService } from '../core/thread-likers.service';
import { Router, ActivatedRoute } from '@angular/router';
import { IThread } from '../shared/interfaces';
import { TakesComponent } from './takes/takes.component';
import { globalCacheBusterNotifier } from 'ngx-cacheable';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { SeoSocialShareService } from '../core/seo-social-share.service';
import { PlayService } from '../core/play.service';
import { PlayComponent } from './play/play.component';

@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss']
})
export class MainComponent {

    @ViewChild(TakesComponent) takesComponent: TakesComponent;
    @ViewChild(PlayComponent) playComponent: PlayComponent;
    tabControl: boolean = false;
    filterBy: string = "TOP";
    all: string = "TOP"; //SBN ERROR
    iconToDisplay: string = "hot-white"; //CHECK_DTG
    place: boolean = false;
    skip: number = 0;
    skipNewest: number = 0;
    skipTop: number = 0;
    skipFollowers: number = 0;
    underlinedTakes: boolean = false;
    underlinedPosts: boolean = true;
    underlinedPlay: boolean = false;
    refresh: boolean = false;
    stickyDimensionsRight: any;
    stickyDimensionsLeft: any;
    errorMessage: string = "";
    threadsDownloaded: boolean = false;
    showMenu: boolean = false;

    hideAnimation: boolean = false;
    modalInstance: any;
    loaderInstance: any;
    scrollSubscription: any;
    scrollTO: any;
    scrollPosition: number;
    stopScroll: boolean = false;
    scrollEnded: boolean = false;
    scrollStarted: boolean = false;
    showHelp: boolean = false;
    sortBy: string = "HOT";
    toggleSort: boolean = false;
    refreshInterval: any;
    lastScrollTop = 0;
    sectionStyle: any;


    constructor(
        @Inject(PLATFORM_ID) private platformId: Object,
        public takeService: TakeService,
        public threadsService: ThreadsService,
        public playService: PlayService,
        private route: ActivatedRoute,
        private seoSocialShareService: SeoSocialShareService,
        public authService: AuthService,
        private likesService: LikesService,
        private threadLikesService: ThreadLikesService,
        private router: Router) {

    }

    

    determineStickyDimensions() {

        if (isPlatformBrowser(this.platformId)) {
            let topRight = window.innerHeight - document.getElementById('right-sticky').offsetHeight - 100;
            this.stickyDimensionsRight = {
                "top": topRight + 'px'
            }

            let topLeft = window.innerHeight - document.getElementById('left-sticky').offsetHeight - 40;
            this.stickyDimensionsLeft = {
                "top": topLeft + 'px'
            }
        }

    }

    deleteThread(threadId: string) {
        this.threadsService.threads = this.threadsService.threads.filter(_thread => _thread._id !== threadId);
    }

    ngAfterViewInit() {

        if (isPlatformBrowser(this.platformId)) {
            setTimeout(() => {
                this.determineStickyDimensions()
            }, 1000);
        }
    }

    getPostsSegment() {

        this.takeService.takes = [];
        
        this.threadsService.loaderActive = true;
        this.takeService.loaderActive = false;
        this.addQueryParams('posts');
        this.restartRefreshInterval();

        //this.content.scrollToTop(); afix
        this.underlinedTakes = false;
        this.underlinedPlay = false;
        this.underlinedPosts = true;
        this.takeService.takesToggled = false;
        this.threadsService.postsToggled = false;
        this.playService.loaderActive = false;
        this.playService.playToggled = false;
        this.playService.trivias = [];


        setTimeout(() => {
            this.threadsService.postsToggled = true;
            //solo se vuelven a cargar las takes por el ngIf del template, asi que hay que volver a bajar threads
            this.navbarGetThreads(this.threadsService.filterBy)

        }, 50);

    }

    getPlaySegment() {

		this.takeService.takes = [];
		this.threadsService.threads = [];
		this.takeService.loaderActive = false;
		this.threadsService.loaderActive = false;
        this.playService.loaderActive = true;
        
        this.addQueryParams('play');
        this.restartRefreshInterval();
		

		this.underlinedTakes = false;
		this.underlinedPlay = true;
		this.underlinedPosts = false;
		this.threadsService.postsToggled = false;
        this.takeService.takesToggled = false;
        this.playService.playToggled = true;
		setTimeout(() => {
			this.playService.playToggled = true;
			this.playComponent.navbarGetPlayItems();
        }, 50);
    

	}

    getTakesSegment() {

        this.threadsService.threads = [];
        this.takeService.loaderActive = true;
        this.threadsService.loaderActive = false;
        this.addQueryParams('discuss');
        this.restartRefreshInterval();

        this.underlinedTakes = true;
        this.underlinedPlay = false;
        this.underlinedPosts = false;
        this.threadsService.postsToggled = false;
        this.takeService.takesToggled = true;

        this.playService.loaderActive = false;
        this.playService.playToggled = false;
        this.playService.trivias = [];


        setTimeout(() => {
            this.takeService.takesToggled = true;
            this.takesComponent.navBarGetTakes()
        }, 50);


    }

    addQueryParams(tab: string) {



    }

    itemTapped(id) {

        this.router.navigate(['/posts', id]);

    }

    restartRefreshInterval() {
        if (isPlatformBrowser(this.platformId)) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = setInterval(() => {
                this.refresh = true;
            }, 2.4e+6)
        }    //40 min
    }

    refreshContent() {

        this.getFeatured(this.threadsService.filterBy)
        if (this.threadsService.followers) {
            this.handlerFollowers('TOP')
        } else {
            this.handleLeagues(this.threadsService.filterBy)
        }

        this.refresh = false;
        this.restartRefreshInterval();

    }

    scrollToTop() {
        window.scrollTo(0, 0);
    }


    goToFeatured() {
        globalCacheBusterNotifier.next()
        this.router.navigate(['/featured']);
    }

    configureSEO() {

        let data = {
            title: "Discuss the Game: The place for die-hard sports fans",
            description: "Discuss the Game is a community-powered platform for die-hard sports fans where users talk sports, create content, share their sports opinions, and chat and connect with fans.",
            site: 'https://www.discussthegame.com/',
            image: "https://discussthegame.s3-us-west-1.amazonaws.com/ui/dtg-share.png",
            large: true,
            website: true
        }
        this.seoSocialShareService.setData(data)
    }


    ngOnInit() {

        this.configureSEO();
        if (isPlatformBrowser(this.platformId)) {

            this.refreshInterval = setInterval(() => {
                this.refresh = true;
            }, 2.4e+6); //40 min
            // if (this.authService.isLoggedIn()) this.saveLeagues();
            let val = localStorage.getItem('motorsports')
            //Para que a todos los que ya la bajaron se les de la oprtunidad de escoger si quieren o no.
            if (!val) {
                localStorage.setItem('motorsports', '1');
                //this.configLeagues();
            }
            let tab = this.route.snapshot.queryParamMap.get('tab')

            if (tab == 'discuss') {
                this.getTakesSegment()
                this.getFeatured('TOP');
            }
            else {
                this.getFeatured('TOP');
                this.getThreads(false, 'TOP');
            }
        }



    }


    gotIt() {
        this.showHelp = false;
    }



    getAllThreads() { //tambien takes y trivias

        this.restartRefreshInterval();
        this.scrollToTop()

        this.threadsService.followers = false;
        this.takeService.followers = false;
        this.threadsService.bookmarks = false;
        this.takeService.bookmarks = false;
        this.threadsService.hideInfinite = true;
        this.takeService.nofollowing = false;
        this.takeService.toggleRefresh = false;
        this.playService.toggleRefresh = false;

        if (this.takeService.takesToggled) {

            this.takeService.loaderActive = true;
            if (this.takeService.hot) {

                this.takesComponent.getTakes('TOP')
            } else if (this.takeService.new) {
                this.takesComponent.getNewestTakes('TOP')

            } else {

                this.takesComponent.getTopTakes('TOP');
            }

        } else if (this.threadsService.postsToggled) {


            this.threadsService.loaderActive = true;
            if (this.threadsService.hot) {
                this.getFeatured('TOP')
                this.getThreads(false, 'TOP')
            } else if (this.threadsService.new) {
                this.getNewestThreads(false, 'TOP')

            } else {
                this.getFeatured('TOP')
                this.getTopThreads(false, 'TOP');
            }
        } else {

            this.playService.loaderActive = true;
            this.playComponent.getPlayItems('TOP')

        }



    }



    sortPosts(sortBy: string) {
        this.restartRefreshInterval();
        this.threadsService.hideInfinite = true;

        if (this.threadsService.postsToggled) {

            if (sortBy == 'HOT') {
                this.sortBy = "HOT";
                this.threadsService.hot = true;
                this.threadsService.new = false;
                this.threadsService.top = false;

                this.takeService.hot = true;
                this.takeService.new = false;
                this.takeService.top = false;

                this.toggleSort = false;
                this.getFeatured(this.threadsService.filterBy)
                this.getThreads(true, this.threadsService.filterBy)

            } else if (sortBy == 'NEW') {

                this.sortBy = "NEW";
                this.threadsService.hot = false;
                this.threadsService.top = false;
                this.threadsService.new = true;

                this.takeService.hot = false;
                this.takeService.top = false;
                this.takeService.new = true;
                this.toggleSort = false;
                this.getNewestThreads(true, this.threadsService.filterBy)

            } else {
                this.sortBy = "TOP";
                this.threadsService.hot = false;
                this.threadsService.top = true;
                this.threadsService.new = false;

                this.takeService.hot = false;
                this.takeService.top = true;
                this.takeService.new = false;
                this.toggleSort = false;
                this.getFeatured(this.threadsService.filterBy)
                this.getTopThreads(true, this.threadsService.filterBy)

            }
        } else {

            if (sortBy == 'HOT') {
                this.sortBy = "HOT";
                this.threadsService.hot = true;
                this.threadsService.new = false;
                this.threadsService.top = false;

                this.takeService.hot = true;
                this.takeService.new = false;
                this.takeService.top = false;
                this.toggleSort = false;

                this.takesComponent.getTakes(this.threadsService.filterBy)

            } else if (sortBy == 'NEW') {
                this.sortBy = "NEW";
                this.threadsService.hot = false;
                this.threadsService.top = false;
                this.threadsService.new = true;

                this.takeService.hot = false;
                this.takeService.top = false;
                this.takeService.new = true;
                this.toggleSort = false;

                this.takesComponent.getNewestTakes(this.threadsService.filterBy)

            } else {
                this.sortBy = "TOP";
                this.threadsService.hot = false;
                this.threadsService.top = true;
                this.threadsService.new = false;

                this.takeService.hot = false;
                this.takeService.top = true;
                this.takeService.new = false;
                this.toggleSort = false;

                this.takesComponent.getTopTakes(this.threadsService.filterBy)

            }
        }
    }


    handleLeagues(league: string) {
        this.scrollToTop()
        this.restartRefreshInterval();
        this.threadsService.followers = false;
        this.takeService.followers = false;
        this.threadsService.bookmarks = false;
        this.takeService.bookmarks = false;
        this.navbarGetThreads(league)
    }


    navbarGetThreads(league: string) {

        if (this.threadsService.postsToggled) {

            this.playService.toggleRefresh = false;
            this.threadsService.toggleRefresh = false;
            this.takeService.toggleRefresh = false;
            this.threadsService.toggleFeaturedRefresh = false;

            if (this.threadsService.followers) {
                this.handlerFollowers(league);
            }
            else if (this.threadsService.bookmarks) {
                this.getSavedThreads();
            }
            else if (this.threadsService.hot) {
                this.getFeatured(league);
                this.getThreads(true, league)
            } else if (this.threadsService.new) {
                this.getNewestThreads(true, league)

            } else {
                this.getFeatured(league);
                this.getTopThreads(true, league);
            }



        } else if (this.takeService.takesToggled) {

            this.playService.toggleRefresh = false;
            this.takeService.toggleRefresh = false;
            this.threadsService.toggleRefresh = false;
            this.threadsService.toggleFeaturedRefresh = false;

            if (this.takeService.followers) {
                this.handlerFollowers(league);
            }
            else if (this.takeService.bookmarks) {
                this.takesComponent.getSavedTakes();
            }
            else if (this.takeService.hot) {
                this.takesComponent.getTakes(league);
            } else if (this.takeService.new) {
                this.takesComponent.getNewestTakes(league);
            } else {
                this.takesComponent.getTopTakes(league);
            }


        } else {
            this.takeService.toggleRefresh = false;
            this.threadsService.toggleRefresh = false;
            this.threadsService.toggleFeaturedRefresh = false;
            this.threadsService.followers = false;
            this.takeService.followers = false;
            this.threadsService.bookmarks = false;
            this.takeService.bookmarks = false;
            this.playComponent.getPlayItems(league);

        }
    }

    getSavedPosts() {

        this.scrollToTop()
        this.restartRefreshInterval();
        this.threadsService.hideInfinite = true;
        this.threadsService.toggleRefresh = false;
        this.takeService.toggleRefresh = false;

        if (this.authService.isLoggedIn()) {


            this.threadsService.followers = false;
            this.takeService.followers = false;
            this.threadsService.bookmarks = true;
            this.takeService.bookmarks = true;


            if (!this.takeService.takesToggled) {

                this.getSavedThreads();
            }
            else {

                this.takeService.loaderActive = true;
                this.takesComponent.getSavedTakes();

            }


        } else {

            this.authService.toggleAccess = true;
            this.authService.register = true;
            this.authService.toggleLogin = false;
        }


    }


    handlerFollowers(league: string) {

        this.scrollToTop()
        this.restartRefreshInterval();
        this.threadsService.hideInfinite = true;
        this.threadsService.toggleRefresh = false;
        this.takeService.toggleRefresh = false;

        if (this.authService.isLoggedIn()) {


            this.threadsService.followers = true;
            this.takeService.followers = true;
            this.threadsService.bookmarks = false;
            this.takeService.bookmarks = false;


            if (!this.takeService.takesToggled) {

                if (this.authService.currentUser.followingNumber == 0) {
                    this.threadsService.threads = [];
                    this.threadsService.nofollowing = true;
                    this.threadsService.loaderActive = false;


                } else {


                    this.getFollowersThreads(true, league);

                }

            }
            else {

                if (this.authService.currentUser.followingNumber == 0) {
                    this.takeService.takes = [];
                    this.takeService.nofollowing = true;
                    this.takeService.loaderActive = false;


                } else {

                    this.takeService.loaderActive = true;
                    this.takesComponent.getFollowersTakes(this.threadsService.filterBy);

                }

            }


        } else {

            this.authService.toggleAccess = true;
            this.authService.register = true;
            this.authService.toggleLogin = false;
        }

    }


    //Followers

    getFollowersThreads(scroll: boolean, league: string) {


        this.threadsService.filterBy = league;
        this.threadsService.skipFollowers = 0;



        this.threadsService.placeholders = true;
        this.threadsService.loaderActive = true;


        this.threadsService.getFollowingThreads(league, this.threadsService.skipFollowers)
            .subscribe((threads: any) => {


                let prov = threads.map((thread: any) => {
                    thread.date = new Date(thread.date);
                    thread.created = this.created(thread);
                    thread.likedByUser = this.userHasLiked(thread);
                    thread.count = thread.likers ? thread.likers.length : 0;
                    thread.levelN = thread.user.badge.picture.replace('.png', 'N.png');
                    return thread;
                })

                this.threadsService.threads = prov
                this.threadsService.loaderActive = false;
                setTimeout(() => {
                    this.threadsService.placeholders = false;
                }, 1000);


                this.threadsService.hideInfinite = false;



            },
                (err) => {

                    this.threadsService.loaderActive = false;
                    this.threadsService.placeholders = false;

                    this.authService.errorMessage = err;
                    setTimeout(() => {
                        this.authService.errorMessage = null;
                    }, 5000);

                })

    }

    getSavedThreads() {

        this.threadsService.skipSaved = 0;
        this.threadsDownloaded = false;
        this.threadsService.loaderActive = true;
        this.threadsService.placeholders = true;
        this.threadsService.threads = []

        this.threadsService.getBookmarks(this.threadsService.skipSaved)
            .subscribe((threads: any) => {

          

                let prov = threads.map((thread: any) => {
                    thread.date = new Date(thread.date);
                    thread.created = this.created(thread);
                    thread.likedByUser = this.userHasLiked(thread);
                    thread.count = thread.likers ? thread.likers.length : 0;
                    thread.levelN = thread.user.badge.picture.replace('.png', 'N.png');

                    return thread;
                })


                this.threadsService.threads = prov

                setTimeout(() => {
                    this.threadsService.placeholders = false;
                }, 500);

                this.threadsService.hideInfinite = false;
                this.threadsService.toggleRefresh = false;
                this.takeService.toggleRefresh = false;
                this.threadsService.loaderActive = false;

                this.threadsService.toggleFeaturedRefresh = false;
                this.threadsDownloaded = true;

                let height = (this.threadsService.threads.length * 350) + 80;
                this.authService.stickyHeight = {
                    "height": height + 'px'
                }
                setTimeout(() => {
                    this.determineStickyDimensions();
                }, 1000);


            },
                (err) => {


                    this.threadsDownloaded = true;
                    this.threadsService.loaderActive = false;
                    this.threadsService.placeholders = false;

                    this.authService.errorMessage = err;
                    setTimeout(() => {
                        this.authService.errorMessage = null;
                    }, 5000);

                })

    }


    getFeatured(league: string) {



        this.threadsService.getFeatured(league, 0)
            .subscribe((threads: any) => {

                let prov = threads.map((thread: any) => {
                    thread.date = new Date(thread.date);
                    thread.created = this.created(thread);
                    thread.likedByUser = this.userHasLiked(thread);
                    thread.count = thread.likers ? thread.likers.length : 0;
                    thread.levelN = thread.user.badge.picture.replace('.png', 'N.png');
                    let reducedText = thread.title.substring(0, 50);
                    if (reducedText.length < thread.title.length) {
                        thread.titleToShow = thread.title.substring(0, 50) + "...";
                    } else {
                        thread.titleToShow = thread.title;
                    }

                    return thread;
                })

                this.threadsService.featuredThreads = prov;
                let loaderInterval = setInterval(() => { //para sincronizar con hot y top threads

                    if (this.threadsService.threads.length || this.threadsDownloaded) {
                        this.threadsService.loaderActive = false;
                        this.threadsService.loadingFeatured = false;
                        clearInterval(loaderInterval)
                    }

                }, 500);


            },
                (err) => {
                    this.threadsService.loadingFeatured = false;
                    this.authService.errorMessage = err;
                    setTimeout(() => {
                        this.authService.errorMessage = null;
                    }, 5000);

                })
    }

    //Followers
    getThreads(scroll: boolean, league: string) {


        this.threadsService.filterBy = league;
        this.threadsService.skip = 0;


        this.threadsDownloaded = false;
        this.threadsService.loaderActive = true;
        this.threadsService.placeholders = true;
        this.threadsService.threads = []

        this.threadsService.getThreads(league, this.threadsService.skip)
            .subscribe((threads: any) => {

                let prov = threads.map((thread: any) => {
                    thread.date = new Date(thread.date);
                    thread.created = this.created(thread);
                    thread.likedByUser = this.userHasLiked(thread);
                    thread.count = thread.likers ? thread.likers.length : 0;
                    thread.levelN = thread.user.badge.picture.replace('.png', 'N.png');

                    return thread;
                })


                this.threadsService.threads = prov

                setTimeout(() => {
                    this.threadsService.placeholders = false;
                }, 500);

                this.threadsService.hideInfinite = false;
                this.threadsService.toggleRefresh = false;
                this.takeService.toggleRefresh = false;

                this.threadsService.loaderActive = false;
                this.threadsService.toggleFeaturedRefresh = false;
                this.threadsDownloaded = true;

                let height = (this.threadsService.threads.length * 350) + 80;
                this.authService.stickyHeight = {
                    "height": height + 'px'
                }
                setTimeout(() => {
                    this.determineStickyDimensions();
                }, 1000);


            },
                (err) => {


                    this.threadsDownloaded = true;
                    this.threadsService.loaderActive = false;
                    this.threadsService.placeholders = false;

                    this.authService.errorMessage = err;
                    setTimeout(() => {
                        this.authService.errorMessage = null;
                    }, 5000);

                })

    }

    getNewestThreads(scroll: boolean = true, league: string) {


        this.threadsService.skipNewest = 0;
        this.threadsService.filterBy = league;


        this.threadsService.placeholders = true;
        this.threadsService.loaderActive = true;
        this.threadsDownloaded = false;



        this.threadsService.getNewestThreads(league, this.threadsService.skipNewest)
            .subscribe((threads: any) => {


                let prov = threads.map((thread: any) => {
                    thread.date = new Date(thread.date);
                    thread.created = this.created(thread);
                    thread.likedByUser = this.userHasLiked(thread);
                    thread.count = thread.likers ? thread.likers.length : 0;
                    thread.levelN = thread.user.badge.picture.replace('.png', 'N.png');

                    return thread;
                })

                this.threadsService.threads = prov
                this.threadsService.loaderActive = false;
                setTimeout(() => {
                    this.threadsService.placeholders = false;
                }, 1000);

                this.threadsService.hideInfinite = false;
                this.threadsService.toggleRefresh = false;
                this.takeService.toggleRefresh = false;
                this.threadsService.toggleFeaturedRefresh = false;

                let height = (this.threadsService.threads.length * 350) + 80;
                this.authService.stickyHeight = {
                    "height": height + 'px'
                }
                this.threadsDownloaded = true;
                setTimeout(() => {
                    this.determineStickyDimensions();
                }, 1000);




            },
                (err) => {


                    this.threadsDownloaded = true;
                    this.threadsService.loaderActive = false;

                    this.threadsService.placeholders = false;

                    this.authService.errorMessage = err;
                    setTimeout(() => {
                        this.authService.errorMessage = null;
                    }, 5000);

                })

    }

    getTopThreads(scroll: boolean = true, league: string) {



        this.threadsDownloaded = false;
        this.threadsService.skipTop = 0;
        this.threadsService.filterBy = league;



        this.threadsService.placeholders = true;
        this.threadsService.loaderActive = true;
        this.threadsService.threads = []

        this.threadsService.getTopThreads(league, this.threadsService.skipTop)
            .subscribe((threads: any) => {



                let prov = threads.map((thread: any) => {
                    thread.date = new Date(thread.date);
                    thread.created = this.created(thread);
                    thread.likedByUser = this.userHasLiked(thread);
                    thread.count = thread.likers ? thread.likers.length : 0;
                    thread.levelN = thread.user.badge.picture.replace('.png', 'N.png');


                    return thread;
                })

                this.threadsService.threads = prov
                setTimeout(() => {
                    this.threadsService.placeholders = false;
                }, 1000);


                this.threadsService.hideInfinite = false;
                this.threadsService.toggleRefresh = false;
                this.takeService.toggleRefresh = false;
                this.threadsService.loaderActive = false;
                this.threadsService.toggleFeaturedRefresh = false;
                let height = (this.threadsService.threads.length * 350) + 80;
                this.authService.stickyHeight = {
                    "height": height + 'px'
                }
                this.threadsDownloaded = true;
                setTimeout(() => {
                    this.determineStickyDimensions();
                }, 1000);

            },
                (err) => {


                    this.threadsDownloaded = false;
                    this.threadsService.loaderActive = false;
                    this.threadsService.placeholders = false;

                    this.authService.errorMessage = err;
                    setTimeout(() => {
                        this.authService.errorMessage = null;
                    }, 5000);

                })

    }




    getMoreFollowersThreads() {

        this.threadsService.getFollowingThreads(this.threadsService.filterBy, this.threadsService.skipFollowers)
            .subscribe((threads: any) => {

                if (threads.length > 0) {

                    let prov = threads.map((thread: any) => {
                        thread.date = new Date(thread.date);
                        thread.created = this.created(thread);
                        thread.likedByUser = this.userHasLiked(thread);
                        thread.count = thread.likers ? thread.likers.length : 0;
                        thread.levelN = thread.user.badge.picture.replace('.png', 'N.png');
                        return thread;
                    })

                    let newThreadsArray = this.threadsService.threads.concat(prov)
                    //Eliminar duplicados. Esto sucede porque continuamente se agregan discusiones a la base de datos; el skip genera esto.
                    let unique = newThreadsArray.filter((item, i, array) => {
                        return array.findIndex((item2) => { return item2._id == item._id }) === i;
                    })
                    this.threadsService.threads = unique;
                    this.threadsService.toggleRefresh = false;
                    this.takeService.toggleRefresh = false;
                    this.threadsService.toggleFeaturedRefresh = false;




                }
                
                let height = (this.threadsService.threads.length * 350) + 80;
                this.authService.stickyHeight = {
                    "height": height + 'px'
                }
                this.threadsService.showInfiniteSpinner = false;
                setTimeout(() => {
                    this.determineStickyDimensions();
                }, 1000);

            },
                (err) => {



                    this.authService.errorMessage = err;
                    setTimeout(() => {
                        this.authService.errorMessage = null;
                    }, 5000);
                    this.threadsService.showInfiniteSpinner = false;

                })

    }


    getMoreSavedThreads() {

        this.threadsService.getBookmarks(this.threadsService.skipSaved)
            .subscribe((threads: any) => {

                if (threads.length > 0) {
                    let provisionalArray = threads.map((thread: any) => {
                        thread.date = new Date(thread.date);
                        thread.created = this.created(thread);
                        thread.likedByUser = this.userHasLiked(thread);
                        thread.count = thread.likers ? thread.likers.length : 0;
                        thread.levelN = thread.user.badge.picture.replace('.png', 'N.png');


                        return thread;
                    })

                    let newThreadsArray = this.threadsService.threads.concat(provisionalArray)
                    //Eliminar duplicados. Esto sucede porque continuamente se agregan discusiones a la base de datos; el skip genera esto.
                    let unique = newThreadsArray.filter((item, i, array) => {
                        return array.findIndex((item2) => { return item2._id == item._id }) === i;
                    })
                    this.threadsService.threads = unique;

                    this.threadsService.loadingMore = false;


                }

                this.threadsService.showInfiniteSpinner = false;

                let height = (this.threadsService.threads.length * 350) + 80;
                this.authService.stickyHeight = {
                    "height": height + 'px'
                }
                setTimeout(() => {
                    this.determineStickyDimensions();
                }, 1000);



            },
                (err) => {


                    this.authService.errorMessage = err;
                    setTimeout(() => {
                        this.authService.errorMessage = null;
                    }, 5000);
                    this.threadsService.showInfiniteSpinner = false;

                })

    }

    getMoreThreads() {

        this.threadsService.getThreads(this.threadsService.filterBy, this.threadsService.skip)
            .subscribe((threads: any) => {

                if (threads.length > 0) {
                    let provisionalArray = threads.map((thread: any) => {
                        thread.date = new Date(thread.date);
                        thread.created = this.created(thread);
                        thread.likedByUser = this.userHasLiked(thread);
                        thread.count = thread.likers ? thread.likers.length : 0;
                        thread.levelN = thread.user.badge.picture.replace('.png', 'N.png');


                        return thread;
                    })

                    let newThreadsArray = this.threadsService.threads.concat(provisionalArray)
                    //Eliminar duplicados. Esto sucede porque continuamente se agregan discusiones a la base de datos; el skip genera esto.
                    let unique = newThreadsArray.filter((item, i, array) => {
                        return array.findIndex((item2) => { return item2._id == item._id }) === i;
                    })
                    this.threadsService.threads = unique;

                    this.threadsService.loadingMore = false;


                }

                this.threadsService.showInfiniteSpinner = false;

                let height = (this.threadsService.threads.length * 350) + 80;
                this.authService.stickyHeight = {
                    "height": height + 'px'
                }
                setTimeout(() => {
                    this.determineStickyDimensions();
                }, 1000);



            },
                (err) => {


                    this.authService.errorMessage = err;
                    setTimeout(() => {
                        this.authService.errorMessage = null;
                    }, 5000);
                    this.threadsService.showInfiniteSpinner = false;

                })

    }

    getMoreNewestThreads() {

        this.threadsService.getNewestThreads(this.threadsService.filterBy, this.threadsService.skipNewest)
            .subscribe((threads: any) => {


                if (threads.length > 0) {
                    let provisionalArray = threads.map((thread: any) => {
                        thread.date = new Date(thread.date);
                        thread.created = this.created(thread);
                        thread.likedByUser = this.userHasLiked(thread);
                        thread.count = thread.likers ? thread.likers.length : 0;
                        thread.levelN = thread.user.badge.picture.replace('.png', 'N.png');


                        return thread;
                    })

                    let newThreadsArray = this.threadsService.threads.concat(provisionalArray)
                    //Eliminar duplicados. Esto sucede porque continuamente se agregan discusiones a la base de datos; el skip genera esto.
                    let unique = newThreadsArray.filter((item, i, array) => {
                        return array.findIndex((item2) => { return item2._id == item._id }) === i;
                    })
                    this.threadsService.threads = unique;


                }

                let height = (this.threadsService.threads.length * 350) + 80;
                this.authService.stickyHeight = {
                    "height": height + 'px'
                }

                this.threadsService.showInfiniteSpinner = false;
                setTimeout(() => {
                    this.determineStickyDimensions();
                }, 1000);





            },
                (err) => {


                    this.authService.errorMessage = err;
                    setTimeout(() => {
                        this.authService.errorMessage = null;
                    }, 5000);
                    this.threadsService.showInfiniteSpinner = false;

                })

    }


    getMoreTopThreads() {

        this.threadsService.getTopThreads(this.threadsService.filterBy, this.threadsService.skipTop)
            .subscribe((threads: any) => {



                if (threads.length > 0) {
                    let provisionalArray = threads.map((thread: any) => {
                        thread.date = new Date(thread.date);
                        thread.created = this.created(thread);
                        thread.likedByUser = this.userHasLiked(thread);
                        thread.count = thread.likers ? thread.likers.length : 0;
                        thread.levelN = thread.user.badge.picture.replace('.png', 'N.png');


                        return thread;
                    })

                    let newThreadsArray = this.threadsService.threads.concat(provisionalArray)
                    //Eliminar duplicados. Esto sucede porque continuamente se agregan discusiones a la base de datos; el skip genera esto.
                    let unique = newThreadsArray.filter((item, i, array) => {
                        return array.findIndex((item2) => { return item2._id == item._id }) === i;
                    })
                    this.threadsService.threads = unique;



                }

                let height = (this.threadsService.threads.length * 350) + 80;
                this.authService.stickyHeight = {
                    "height": height + 'px'
                }
                this.threadsService.showInfiniteSpinner = false;
                setTimeout(() => {
                    this.determineStickyDimensions();
                }, 1000);





            },
                (err) => {


                    this.authService.errorMessage = err;
                    setTimeout(() => {
                        this.authService.errorMessage = null;
                    }, 5000);
                    this.threadsService.showInfiniteSpinner = false;

                })

    }

    created(thread: IThread): string {

        let milliseconds = thread.date.getTime();
        let now = new Date();
        let millisecondsNow = now.getTime();
        let diffInHours = (millisecondsNow - milliseconds) / (1000 * 60 * 60); //hours
        let typeTime;

        if (diffInHours >= 24) {
            //DAYS
            let threadCreated = Math.floor(diffInHours / 24); //Template binding
            typeTime = "d"
            return `${threadCreated}${typeTime}`

        } else if (diffInHours < 1 && diffInHours > 0) {
            //MINUTES
            let threadCreated = Math.ceil(diffInHours * 60); //Template binding
            typeTime = "min"
            return `${threadCreated}${typeTime}`

        } else {
            //HOURS   
            let threadCreated = Math.floor(diffInHours); //Template binding
            typeTime = "h"
            return `${threadCreated}${typeTime}`

        }

    }

    userHasLiked(thread: IThread) {



        if (this.authService.currentUser) {
            return this.likesService.userHasLiked(thread, this.authService.currentUser._id);
        } else {
            return false;
        }
    }


    doInfinite() {


        let path = this.router.url.split('?')
        if (this.threadsService.showInfiniteSpinner || path[0] != '/home') return;
        this.threadsService.showInfiniteSpinner = true;

        if (this.takeService.takesToggled) {

            if (this.takeService.followers) {
                this.takeService.skipFollowers += 10;
                if (this.takeService.takes.length > 0) {
                    this.takesComponent.getMoreFollowersTakes();
                } else {
                    this.threadsService.showInfiniteSpinner = false;
                }
            }
            else if (this.takeService.bookmarks) {
                this.takeService.skipSaved += 10;
                if (this.takeService.takes.length > 0) this.takesComponent.getMoreSavedTakes();
                else {
                    this.threadsService.showInfiniteSpinner = false;
                }
                

            }
            else if (this.takeService.hot) {
                this.takeService.skip += 10;
                if (this.takeService.takes.length > 0) this.takesComponent.getMoreTakes();
                else {
                    this.threadsService.showInfiniteSpinner = false;
                }

            } else if (this.takeService.new) {
                this.takeService.skipNewest += 10;
                if (this.takeService.takes.length > 0) this.takesComponent.getMoreNewestTakes();
                else {
                    this.threadsService.showInfiniteSpinner = false;
                }

            } else {
                this.takeService.skipTop += 10;
                if (this.takeService.takes.length > 0) this.takesComponent.getMoreTopTakes();
                else {
                    this.threadsService.showInfiniteSpinner = false;
                }
            }



        } else {


            if (this.threadsService.followers) {
                this.threadsService.skipFollowers += 8;
                if (this.threadsService.threads.length > 0) this.getMoreFollowersThreads();
                else {
                    this.threadsService.showInfiniteSpinner = false;
                }

            }
            else if (this.threadsService.bookmarks) {
                this.threadsService.skipSaved += 8;
                if (this.threadsService.threads.length > 0) this.getMoreSavedThreads();
                else {
                    this.threadsService.showInfiniteSpinner = false;
                }

            }
            else if (this.threadsService.hot) {
                this.threadsService.skip += 8;
                if (this.threadsService.threads.length > 0) this.getMoreThreads();
                else {
                    this.threadsService.showInfiniteSpinner = false;
                }

            } else if (this.threadsService.new) {
                this.threadsService.skipNewest += 8;
                if (this.threadsService.threads.length > 0) this.getMoreNewestThreads();
                else {
                    this.threadsService.showInfiniteSpinner = false;
                }

            } else {
                this.threadsService.skipTop += 8;
                if (this.threadsService.threads.length > 0) this.getMoreTopThreads();
                else {
                    this.threadsService.showInfiniteSpinner = false;
                }
            }

        }

    }




}

