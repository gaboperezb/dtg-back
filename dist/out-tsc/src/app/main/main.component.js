import { __decorate, __param } from "tslib";
import { Component, ViewChild, Inject } from '@angular/core';
import { TakesComponent } from './takes/takes.component';
import { globalCacheBusterNotifier } from 'ngx-cacheable';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
let MainComponent = class MainComponent {
    constructor(platformId, takeService, threadsService, route, seoSocialShareService, authService, likesService, threadLikesService, router) {
        this.platformId = platformId;
        this.takeService = takeService;
        this.threadsService = threadsService;
        this.route = route;
        this.seoSocialShareService = seoSocialShareService;
        this.authService = authService;
        this.likesService = likesService;
        this.threadLikesService = threadLikesService;
        this.router = router;
        this.tabControl = false;
        this.filterBy = "TOP";
        this.all = "TOP"; //SBN ERROR
        this.iconToDisplay = "hot-white"; //CHECK_DTG
        this.place = false;
        this.skip = 0;
        this.skipNewest = 0;
        this.skipTop = 0;
        this.skipFollowers = 0;
        this.underlinedTakes = false;
        this.underlinedPosts = true;
        this.underlinedPlay = false;
        this.refresh = false;
        this.errorMessage = "";
        this.threadsDownloaded = false;
        this.showMenu = false;
        this.hideAnimation = false;
        this.stopScroll = false;
        this.scrollEnded = false;
        this.scrollStarted = false;
        this.showHelp = false;
        this.sortBy = "HOT";
        this.toggleSort = false;
        this.lastScrollTop = 0;
    }
    determineStickyDimensions() {
        if (isPlatformBrowser(this.platformId)) {
            let topRight = window.innerHeight - document.getElementById('right-sticky').offsetHeight - 100;
            this.stickyDimensionsRight = {
                "top": topRight + 'px'
            };
            let topLeft = window.innerHeight - document.getElementById('left-sticky').offsetHeight - 40;
            this.stickyDimensionsLeft = {
                "top": topLeft + 'px'
            };
        }
    }
    deleteThread(threadId) {
        this.threadsService.threads = this.threadsService.threads.filter(_thread => _thread._id !== threadId);
    }
    ngAfterViewInit() {
        if (isPlatformBrowser(this.platformId)) {
            setTimeout(() => {
                this.determineStickyDimensions();
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
        setTimeout(() => {
            this.threadsService.postsToggled = true;
            //solo se vuelven a cargar las takes por el ngIf del template, asi que hay que volver a bajar threads
            this.navbarGetThreads(this.threadsService.filterBy);
        }, 50);
    }
    getTakesSegment() {
        this.threadsService.threads = [];
        this.takeService.loaderActive = true;
        this.threadsService.loaderActive = false;
        this.addQueryParams('discuss');
        this.restartRefreshInterval();
        //para evitar lag, primero nos enfocamos en lo visual y despues cargamos las takes
        //this.content.scrollToTop() afix
        this.underlinedTakes = true;
        this.underlinedPlay = false;
        this.underlinedPosts = false;
        this.threadsService.postsToggled = false;
        this.takeService.takesToggled = true;
        setTimeout(() => {
            this.takeService.takesToggled = true;
            this.takesComponent.navBarGetTakes();
        }, 50);
    }
    addQueryParams(tab) {
    }
    itemTapped(id) {
        this.router.navigate(['/posts', id]);
    }
    restartRefreshInterval() {
        clearInterval(this.refreshInterval);
        this.refreshInterval = setInterval(() => {
            this.refresh = true;
        }, 2.4e+6); //40 min
    }
    refreshContent() {
        this.getFeatured(this.threadsService.filterBy);
        if (this.threadsService.followers) {
            this.handlerFollowers('TOP');
        }
        else {
            this.handleLeagues(this.threadsService.filterBy);
        }
        this.refresh = false;
        this.restartRefreshInterval();
    }
    scrollToTop() {
        window.scrollTo(0, 0);
    }
    goToFeatured() {
        globalCacheBusterNotifier.next();
        this.router.navigate(['/featured']);
    }
    configureSEO() {
        let data = {
            title: "Discuss TheGame: The place for die-hard sports fans",
            description: "Discuss TheGame is a community-powered platform for die-hard sports fans where users talk sports, create content, share their sports opinions, and chat and connect with fans.",
            site: 'http://localhost:3000/',
            image: "https://discussthegame.s3-us-west-1.amazonaws.com/ui/dtg-share.png",
            large: true,
            website: true
        };
        this.seoSocialShareService.setData(data);
    }
    ngOnInit() {
        this.configureSEO();
        if (isPlatformBrowser(this.platformId)) {
            this.refreshInterval = setInterval(() => {
                this.refresh = true;
            }, 2.4e+6); //40 min
            // if (this.authService.isLoggedIn()) this.saveLeagues();
            let val = localStorage.getItem('motorsports');
            //Para que a todos los que ya la bajaron se les de la oprtunidad de escoger si quieren o no.
            if (!val) {
                localStorage.setItem('motorsports', '1');
                //this.configLeagues();
            }
            let tab = this.route.snapshot.queryParamMap.get('tab');
            if (tab == 'discuss') {
                this.getTakesSegment();
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
    getAllThreads() {
        this.restartRefreshInterval();
        this.scrollToTop();
        this.threadsService.followers = false;
        this.takeService.followers = false;
        this.threadsService.hideInfinite = true;
        this.takeService.nofollowing = false;
        this.takeService.toggleRefresh = false;
        if (this.takeService.takesToggled) {
            this.takeService.loaderActive = true;
            if (this.takeService.hot) {
                this.takesComponent.getTakes('TOP');
            }
            else if (this.takeService.new) {
                this.takesComponent.getNewestTakes('TOP');
            }
            else {
                this.takesComponent.getTopTakes('TOP');
            }
        }
        else if (this.threadsService.postsToggled) {
            this.threadsService.loaderActive = true;
            if (this.threadsService.hot) {
                this.getFeatured('TOP');
                this.getThreads(false, 'TOP');
            }
            else if (this.threadsService.new) {
                this.getNewestThreads(false, 'TOP');
            }
            else {
                this.getFeatured('TOP');
                this.getTopThreads(false, 'TOP');
            }
        }
    }
    sortPosts(sortBy) {
        this.restartRefreshInterval();
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
                this.getFeatured(this.threadsService.filterBy);
                this.getThreads(true, this.threadsService.filterBy);
            }
            else if (sortBy == 'NEW') {
                this.sortBy = "NEW";
                this.threadsService.hot = false;
                this.threadsService.top = false;
                this.threadsService.new = true;
                this.takeService.hot = false;
                this.takeService.top = false;
                this.takeService.new = true;
                this.toggleSort = false;
                this.getNewestThreads(true, this.threadsService.filterBy);
            }
            else {
                this.sortBy = "TOP";
                this.threadsService.hot = false;
                this.threadsService.top = true;
                this.threadsService.new = false;
                this.takeService.hot = false;
                this.takeService.top = true;
                this.takeService.new = false;
                this.toggleSort = false;
                this.getFeatured(this.threadsService.filterBy);
                this.getTopThreads(true, this.threadsService.filterBy);
            }
        }
        else {
            if (sortBy == 'HOT') {
                this.sortBy = "HOT";
                this.threadsService.hot = true;
                this.threadsService.new = false;
                this.threadsService.top = false;
                this.takeService.hot = true;
                this.takeService.new = false;
                this.takeService.top = false;
                this.toggleSort = false;
                this.takesComponent.getTakes(this.threadsService.filterBy);
            }
            else if (sortBy == 'NEW') {
                this.sortBy = "NEW";
                this.threadsService.hot = false;
                this.threadsService.top = false;
                this.threadsService.new = true;
                this.takeService.hot = false;
                this.takeService.top = false;
                this.takeService.new = true;
                this.toggleSort = false;
                this.takesComponent.getNewestTakes(this.threadsService.filterBy);
            }
            else {
                this.sortBy = "TOP";
                this.threadsService.hot = false;
                this.threadsService.top = true;
                this.threadsService.new = false;
                this.takeService.hot = false;
                this.takeService.top = true;
                this.takeService.new = false;
                this.toggleSort = false;
                this.takesComponent.getTopTakes(this.threadsService.filterBy);
            }
        }
    }
    handleLeagues(league) {
        this.scrollToTop();
        this.restartRefreshInterval();
        this.threadsService.followers = false;
        this.takeService.followers = false;
        this.navbarGetThreads(league);
    }
    navbarGetThreads(league) {
        if (this.threadsService.postsToggled) {
            this.threadsService.toggleRefresh = false;
            this.takeService.toggleRefresh = false;
            this.threadsService.toggleFeaturedRefresh = false;
            if (this.threadsService.followers) {
                this.handlerFollowers(league);
            }
            else if (this.threadsService.hot) {
                this.getFeatured(league);
                this.getThreads(true, league);
            }
            else if (this.threadsService.new) {
                this.getNewestThreads(true, league);
            }
            else {
                this.getFeatured(league);
                this.getTopThreads(true, league);
            }
        }
        else if (this.takeService.takesToggled) {
            this.takeService.toggleRefresh = false;
            this.threadsService.toggleRefresh = false;
            this.threadsService.toggleFeaturedRefresh = false;
            if (this.takeService.followers) {
                this.handlerFollowers(league);
            }
            else if (this.takeService.hot) {
                this.takesComponent.getTakes(league);
            }
            else if (this.takeService.new) {
                this.takesComponent.getNewestTakes(league);
            }
            else {
                this.takesComponent.getTopTakes(league);
            }
        }
        else {
            this.takeService.toggleRefresh = false;
            this.threadsService.toggleRefresh = false;
            this.threadsService.toggleFeaturedRefresh = false;
            this.threadsService.followers = false;
            this.takeService.followers = false;
        }
    }
    handlerFollowers(league) {
        this.scrollToTop();
        this.restartRefreshInterval();
        this.threadsService.hideInfinite = true;
        this.threadsService.toggleRefresh = false;
        this.takeService.toggleRefresh = false;
        if (this.authService.isLoggedIn()) {
            this.threadsService.followers = true;
            this.takeService.followers = true;
            if (!this.takeService.takesToggled) {
                if (this.authService.currentUser.followingNumber == 0) {
                    this.threadsService.threads = [];
                    this.threadsService.nofollowing = true;
                    this.threadsService.loaderActive = false;
                }
                else {
                    this.getFollowersThreads(true, league);
                }
            }
            else {
                if (this.authService.currentUser.followingNumber == 0) {
                    this.takeService.takes = [];
                    this.takeService.nofollowing = true;
                    this.takeService.loaderActive = false;
                }
                else {
                    this.takeService.loaderActive = true;
                    this.takesComponent.getFollowersTakes(this.threadsService.filterBy);
                }
            }
        }
        else {
            this.authService.toggleAccess = true;
            this.authService.register = true;
            this.authService.toggleLogin = false;
        }
    }
    //Followers
    getFollowersThreads(scroll, league) {
        this.threadsService.filterBy = league;
        this.threadsService.skipFollowers = 0;
        this.threadsService.placeholders = true;
        this.threadsService.loaderActive = true;
        this.threadsService.getFollowingThreads(league, this.threadsService.skipFollowers)
            .subscribe((threads) => {
            let prov = threads.map((thread) => {
                thread.date = new Date(thread.date);
                thread.created = this.created(thread);
                thread.likedByUser = this.userHasLiked(thread);
                thread.count = thread.likers ? thread.likers.length : 0;
                thread.levelN = thread.user.badge.picture.replace('.png', 'N.png');
                return thread;
            });
            this.threadsService.threads = prov;
            this.threadsService.loaderActive = false;
            setTimeout(() => {
                this.threadsService.placeholders = false;
            }, 1000);
            this.threadsService.hideInfinite = false;
        }, (err) => {
            this.threadsService.loaderActive = false;
            this.threadsService.placeholders = false;
            this.authService.errorMessage = err;
            setTimeout(() => {
                this.authService.errorMessage = null;
            }, 5000);
        });
    }
    getFeatured(league) {
        this.threadsService.getFeatured(league, 0)
            .subscribe((threads) => {
            let prov = threads.map((thread) => {
                thread.date = new Date(thread.date);
                thread.created = this.created(thread);
                thread.likedByUser = this.userHasLiked(thread);
                thread.count = thread.likers ? thread.likers.length : 0;
                thread.levelN = thread.user.badge.picture.replace('.png', 'N.png');
                let reducedText = thread.title.substring(0, 50);
                if (reducedText.length < thread.title.length) {
                    thread.titleToShow = thread.title.substring(0, 50) + "...";
                }
                else {
                    thread.titleToShow = thread.title;
                }
                return thread;
            });
            this.threadsService.featuredThreads = prov;
            let loaderInterval = setInterval(() => {
                if (this.threadsService.threads.length || this.threadsDownloaded) {
                    this.threadsService.loaderActive = false;
                    this.threadsService.loadingFeatured = false;
                    clearInterval(loaderInterval);
                }
            }, 500);
        }, (err) => {
            this.threadsService.loadingFeatured = false;
            this.authService.errorMessage = err;
            setTimeout(() => {
                this.authService.errorMessage = null;
            }, 5000);
        });
    }
    //Followers
    getThreads(scroll, league) {
        this.threadsService.filterBy = league;
        this.threadsService.skip = 0;
        this.threadsDownloaded = false;
        this.threadsService.loaderActive = true;
        this.threadsService.placeholders = true;
        this.threadsService.threads = [];
        this.threadsService.getThreads(league, this.threadsService.skip)
            .subscribe((threads) => {
            let prov = threads.map((thread) => {
                thread.date = new Date(thread.date);
                thread.created = this.created(thread);
                thread.likedByUser = this.userHasLiked(thread);
                thread.count = thread.likers ? thread.likers.length : 0;
                thread.levelN = thread.user.badge.picture.replace('.png', 'N.png');
                return thread;
            });
            this.threadsService.threads = prov;
            setTimeout(() => {
                this.threadsService.placeholders = false;
            }, 500);
            this.threadsService.hideInfinite = false;
            this.threadsService.toggleRefresh = false;
            this.takeService.toggleRefresh = false;
            this.threadsService.toggleFeaturedRefresh = false;
            this.threadsDownloaded = true;
            let height = (this.threadsService.threads.length * 350) + 80;
            this.authService.stickyHeight = {
                "height": height + 'px'
            };
            setTimeout(() => {
                this.determineStickyDimensions();
            }, 1000);
        }, (err) => {
            this.threadsDownloaded = true;
            this.threadsService.loaderActive = false;
            this.threadsService.placeholders = false;
            this.authService.errorMessage = err;
            setTimeout(() => {
                this.authService.errorMessage = null;
            }, 5000);
        });
    }
    getNewestThreads(scroll = true, league) {
        this.threadsService.skipNewest = 0;
        this.threadsService.filterBy = league;
        this.threadsService.placeholders = true;
        this.threadsService.loaderActive = true;
        this.threadsDownloaded = false;
        this.threadsService.getNewestThreads(league, this.threadsService.skipNewest)
            .subscribe((threads) => {
            let prov = threads.map((thread) => {
                thread.date = new Date(thread.date);
                thread.created = this.created(thread);
                thread.likedByUser = this.userHasLiked(thread);
                thread.count = thread.likers ? thread.likers.length : 0;
                thread.levelN = thread.user.badge.picture.replace('.png', 'N.png');
                return thread;
            });
            this.threadsService.threads = prov;
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
            };
            this.threadsDownloaded = true;
            setTimeout(() => {
                this.determineStickyDimensions();
            }, 1000);
        }, (err) => {
            this.threadsDownloaded = true;
            this.threadsService.loaderActive = false;
            this.threadsService.placeholders = false;
            this.authService.errorMessage = err;
            setTimeout(() => {
                this.authService.errorMessage = null;
            }, 5000);
        });
    }
    getTopThreads(scroll = true, league) {
        this.threadsDownloaded = false;
        this.threadsService.skipTop = 0;
        this.threadsService.filterBy = league;
        this.threadsService.placeholders = true;
        this.threadsService.loaderActive = true;
        this.threadsService.threads = [];
        this.threadsService.getTopThreads(league, this.threadsService.skipTop)
            .subscribe((threads) => {
            let prov = threads.map((thread) => {
                thread.date = new Date(thread.date);
                thread.created = this.created(thread);
                thread.likedByUser = this.userHasLiked(thread);
                thread.count = thread.likers ? thread.likers.length : 0;
                thread.levelN = thread.user.badge.picture.replace('.png', 'N.png');
                return thread;
            });
            this.threadsService.threads = prov;
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
            };
            this.threadsDownloaded = true;
            setTimeout(() => {
                this.determineStickyDimensions();
            }, 1000);
        }, (err) => {
            this.threadsDownloaded = false;
            this.threadsService.loaderActive = false;
            this.threadsService.placeholders = false;
            this.authService.errorMessage = err;
            setTimeout(() => {
                this.authService.errorMessage = null;
            }, 5000);
        });
    }
    getMoreFollowersThreads() {
        this.threadsService.getFollowingThreads(this.threadsService.filterBy, this.threadsService.skipFollowers)
            .subscribe((threads) => {
            if (threads.length > 0) {
                let prov = threads.map((thread) => {
                    thread.date = new Date(thread.date);
                    thread.created = this.created(thread);
                    thread.likedByUser = this.userHasLiked(thread);
                    thread.count = thread.likers ? thread.likers.length : 0;
                    thread.levelN = thread.user.badge.picture.replace('.png', 'N.png');
                    return thread;
                });
                let newThreadsArray = this.threadsService.threads.concat(prov);
                //Eliminar duplicados. Esto sucede porque continuamente se agregan discusiones a la base de datos; el skip genera esto.
                let unique = newThreadsArray.filter((item, i, array) => {
                    return array.findIndex((item2) => { return item2._id == item._id; }) === i;
                });
                this.threadsService.threads = unique;
                this.threadsService.toggleRefresh = false;
                this.takeService.toggleRefresh = false;
                this.threadsService.toggleFeaturedRefresh = false;
            }
            let height = (this.threadsService.threads.length * 350) + 80;
            this.authService.stickyHeight = {
                "height": height + 'px'
            };
            this.threadsService.showInfiniteSpinner = false;
            setTimeout(() => {
                this.determineStickyDimensions();
            }, 1000);
        }, (err) => {
            this.authService.errorMessage = err;
            setTimeout(() => {
                this.authService.errorMessage = null;
            }, 5000);
            this.threadsService.showInfiniteSpinner = false;
        });
    }
    getMoreThreads() {
        this.threadsService.getThreads(this.threadsService.filterBy, this.threadsService.skip)
            .subscribe((threads) => {
            if (threads.length > 0) {
                let provisionalArray = threads.map((thread) => {
                    thread.date = new Date(thread.date);
                    thread.created = this.created(thread);
                    thread.likedByUser = this.userHasLiked(thread);
                    thread.count = thread.likers ? thread.likers.length : 0;
                    thread.levelN = thread.user.badge.picture.replace('.png', 'N.png');
                    return thread;
                });
                let newThreadsArray = this.threadsService.threads.concat(provisionalArray);
                //Eliminar duplicados. Esto sucede porque continuamente se agregan discusiones a la base de datos; el skip genera esto.
                let unique = newThreadsArray.filter((item, i, array) => {
                    return array.findIndex((item2) => { return item2._id == item._id; }) === i;
                });
                this.threadsService.threads = unique;
                this.threadsService.loadingMore = false;
            }
            this.threadsService.showInfiniteSpinner = false;
            let height = (this.threadsService.threads.length * 350) + 80;
            this.authService.stickyHeight = {
                "height": height + 'px'
            };
            setTimeout(() => {
                this.determineStickyDimensions();
            }, 1000);
        }, (err) => {
            this.authService.errorMessage = err;
            setTimeout(() => {
                this.authService.errorMessage = null;
            }, 5000);
            this.threadsService.showInfiniteSpinner = false;
        });
    }
    getMoreNewestThreads() {
        this.threadsService.getNewestThreads(this.threadsService.filterBy, this.threadsService.skipNewest)
            .subscribe((threads) => {
            if (threads.length > 0) {
                let provisionalArray = threads.map((thread) => {
                    thread.date = new Date(thread.date);
                    thread.created = this.created(thread);
                    thread.likedByUser = this.userHasLiked(thread);
                    thread.count = thread.likers ? thread.likers.length : 0;
                    thread.levelN = thread.user.badge.picture.replace('.png', 'N.png');
                    return thread;
                });
                let newThreadsArray = this.threadsService.threads.concat(provisionalArray);
                //Eliminar duplicados. Esto sucede porque continuamente se agregan discusiones a la base de datos; el skip genera esto.
                let unique = newThreadsArray.filter((item, i, array) => {
                    return array.findIndex((item2) => { return item2._id == item._id; }) === i;
                });
                this.threadsService.threads = unique;
            }
            let height = (this.threadsService.threads.length * 350) + 80;
            this.authService.stickyHeight = {
                "height": height + 'px'
            };
            this.threadsService.showInfiniteSpinner = false;
            setTimeout(() => {
                this.determineStickyDimensions();
            }, 1000);
        }, (err) => {
            this.authService.errorMessage = err;
            setTimeout(() => {
                this.authService.errorMessage = null;
            }, 5000);
            this.threadsService.showInfiniteSpinner = false;
        });
    }
    getMoreTopThreads() {
        this.threadsService.getTopThreads(this.threadsService.filterBy, this.threadsService.skipTop)
            .subscribe((threads) => {
            if (threads.length > 0) {
                let provisionalArray = threads.map((thread) => {
                    thread.date = new Date(thread.date);
                    thread.created = this.created(thread);
                    thread.likedByUser = this.userHasLiked(thread);
                    thread.count = thread.likers ? thread.likers.length : 0;
                    thread.levelN = thread.user.badge.picture.replace('.png', 'N.png');
                    return thread;
                });
                let newThreadsArray = this.threadsService.threads.concat(provisionalArray);
                //Eliminar duplicados. Esto sucede porque continuamente se agregan discusiones a la base de datos; el skip genera esto.
                let unique = newThreadsArray.filter((item, i, array) => {
                    return array.findIndex((item2) => { return item2._id == item._id; }) === i;
                });
                this.threadsService.threads = unique;
            }
            let height = (this.threadsService.threads.length * 350) + 80;
            this.authService.stickyHeight = {
                "height": height + 'px'
            };
            this.threadsService.showInfiniteSpinner = false;
            setTimeout(() => {
                this.determineStickyDimensions();
            }, 1000);
        }, (err) => {
            this.authService.errorMessage = err;
            setTimeout(() => {
                this.authService.errorMessage = null;
            }, 5000);
            this.threadsService.showInfiniteSpinner = false;
        });
    }
    created(thread) {
        let milliseconds = thread.date.getTime();
        let now = new Date();
        let millisecondsNow = now.getTime();
        let diffInHours = (millisecondsNow - milliseconds) / (1000 * 60 * 60); //hours
        let typeTime;
        if (diffInHours >= 24) {
            //DAYS
            let threadCreated = Math.floor(diffInHours / 24); //Template binding
            typeTime = "d";
            return `${threadCreated}${typeTime}`;
        }
        else if (diffInHours < 1 && diffInHours > 0) {
            //MINUTES
            let threadCreated = Math.ceil(diffInHours * 60); //Template binding
            typeTime = "min";
            return `${threadCreated}${typeTime}`;
        }
        else {
            //HOURS   
            let threadCreated = Math.floor(diffInHours); //Template binding
            typeTime = "h";
            return `${threadCreated}${typeTime}`;
        }
    }
    userHasLiked(thread) {
        if (this.authService.currentUser) {
            return this.likesService.userHasLiked(thread, this.authService.currentUser._id);
        }
        else {
            return false;
        }
    }
    doInfinite() {
        let path = this.router.url.split('?');
        if (this.threadsService.showInfiniteSpinner || path[0] != '/home')
            return;
        this.threadsService.showInfiniteSpinner = true;
        if (this.takeService.takesToggled) {
            if (this.takeService.followers) {
                this.takeService.skipFollowers += 10;
                if (this.takeService.takes.length > 0) {
                    this.takesComponent.getMoreFollowersTakes();
                }
            }
            else if (this.takeService.hot) {
                this.takeService.skip += 10;
                if (this.takeService.takes.length > 0)
                    this.takesComponent.getMoreTakes();
            }
            else if (this.takeService.new) {
                this.takeService.skipNewest += 10;
                if (this.takeService.takes.length > 0)
                    this.takesComponent.getMoreNewestTakes();
            }
            else {
                this.takeService.skipTop += 10;
                if (this.takeService.takes.length > 0)
                    this.takesComponent.getMoreTopTakes();
            }
        }
        else {
            if (this.threadsService.followers) {
                this.threadsService.skipFollowers += 8;
                if (this.threadsService.threads.length > 0)
                    this.getMoreFollowersThreads();
            }
            else if (this.threadsService.hot) {
                this.threadsService.skip += 8;
                if (this.threadsService.threads.length > 0)
                    this.getMoreThreads();
            }
            else if (this.threadsService.new) {
                this.threadsService.skipNewest += 8;
                if (this.threadsService.threads.length > 0)
                    this.getMoreNewestThreads();
            }
            else {
                this.threadsService.skipTop += 8;
                if (this.threadsService.threads.length > 0)
                    this.getMoreTopThreads();
            }
        }
    }
};
__decorate([
    ViewChild(TakesComponent)
], MainComponent.prototype, "takesComponent", void 0);
MainComponent = __decorate([
    Component({
        selector: 'app-main',
        templateUrl: './main.component.html',
        styleUrls: ['./main.component.scss']
    }),
    __param(0, Inject(PLATFORM_ID))
], MainComponent);
export { MainComponent };
//# sourceMappingURL=main.component.js.map