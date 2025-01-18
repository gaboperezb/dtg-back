import { __decorate, __param } from "tslib";
import { Component, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
let UserComponent = class UserComponent {
    constructor(route, threadsService, likesService, router, seoSocialShareService, platformId, webSocketService, authService) {
        this.route = route;
        this.threadsService = threadsService;
        this.likesService = likesService;
        this.router = router;
        this.seoSocialShareService = seoSocialShareService;
        this.platformId = platformId;
        this.webSocketService = webSocketService;
        this.authService = authService;
        this.wait = true;
        this.waitProfile = false;
        this.enableInfinite = false;
        this.threads = [];
        this.takes = [];
        this.skipPosts = 0;
        this.toggleEdit = false;
        this.skipTakes = 0;
        this.takesBoolean = false;
        this.skipTrivias = 0;
        this.triviasBoolean = false;
        this.postsBoolean = true;
        this.commentsBoolean = false;
        this.answersBoolean = false;
        this.blocked = false;
        this.cached = false;
        this.filterBy = "TOP";
        this.largeLevel = "";
        this.commaPoints = "";
        this.comments = [];
        this.answers = [];
        this.showInfiniteSpinner = false;
        this.skipComments = 0;
        this.skipAnswers = 0;
    }
    ngOnInit() {
        this.route.data
            .subscribe((data) => {
            if (data.data.error) {
                this.authService.errorMessage = "Not found";
                if (isPlatformBrowser(this.platformId)) {
                    setTimeout(() => {
                        this.authService.errorMessage = null;
                    }, 5000);
                }
            }
            else {
                if (!this.user || this.user.username != data.data.user.username)
                    this.configureUser(data.data.user);
            }
        });
    }
    settings() {
        this.router.navigate(['/me/settings']);
    }
    handlePosts(league) {
        this.wait = true;
        if (this.postsBoolean) {
            this.getThreads(league);
        }
        else {
            this.getTakes(league);
        }
    }
    configureSEO() {
        let data = {
            title: this.user.username + " - Discuss TheGame",
            description: this.user.bio,
            site: 'http://localhost:3000/u/' + this.user._id,
            image: this.user.profilePicture,
            large: false
        };
        this.seoSocialShareService.setData(data);
    }
    configureUser(user) {
        this.user = user;
        this.configureSEO();
        this.largeLevel = this.user.badge.picture.replace(".png", "L.png");
        this.commaPoints = this.numberWithCommas(this.user.totalPoints);
        this.followRelation();
        this.blockRelation();
        this.setInitialSettings();
        if (isPlatformBrowser(this.platformId)) {
            this.getThreads(this.filterBy);
        }
    }
    getPostsSegment() {
        this.postsBoolean = true;
        this.takesBoolean = false;
        this.answersBoolean = false;
        this.commentsBoolean = false;
        this.wait = true;
        this.getThreads(this.filterBy);
    }
    getTakesSegment() {
        this.postsBoolean = false;
        this.takesBoolean = true;
        this.answersBoolean = false;
        this.commentsBoolean = false;
        this.wait = true;
        this.getTakes(this.filterBy);
    }
    getCommentsSegment() {
        this.postsBoolean = false;
        this.commentsBoolean = true;
        this.takesBoolean = false;
        this.answersBoolean = false;
        this.wait = true;
        this.getComments();
    }
    getAnswersSegment() {
        this.postsBoolean = false;
        this.commentsBoolean = false;
        this.takesBoolean = false;
        this.answersBoolean = true;
        this.wait = true;
        this.getAnswers();
    }
    getComments() {
        this.wait = true;
        this.authService.getUserThreadDiscussions(0)
            .subscribe((comments) => {
            comments = comments.filter(comment => comment.thread || comment.trivia || comment.take);
            if (comments.length >= 15) {
                this.enableInfinite = true;
            }
            else {
                this.enableInfinite = false;
            }
            if (comments.length > 0) {
                let provisionalArray = comments.map((comment) => {
                    comment.date = new Date(comment.date);
                    comment.user = this.authService.currentUser;
                    comment.created = this.created(comment);
                    comment.likedByUser = this.userHasLiked(comment);
                    if (comment.thread) {
                        comment.thread.date = new Date(comment.thread.date);
                        comment.thread.likedByUser = this.userHasLiked(comment.thread);
                        comment.thread.count = comment.thread.likers ? comment.thread.likers.length : 0;
                    }
                    return comment;
                });
                this.comments = provisionalArray;
            }
            this.wait = false;
        }, (err) => {
            this.authService.errorMessage = err;
            setTimeout(() => {
                this.authService.errorMessage = null;
            }, 5000);
            this.wait = false;
        });
    }
    getAnswers() {
        this.enableInfinite = true;
        this.authService.getUserThreadAnswers(0)
            .subscribe((comments) => {
            comments = comments.filter(comment => comment.thread || comment.take || comment.trivia);
            if (comments.length >= 15) {
                this.enableInfinite = true;
            }
            else {
                this.enableInfinite = false;
            }
            if (comments.length > 0) {
                let provisionalArray = comments.map((comment) => {
                    comment.answers.date = new Date(comment.answers.date);
                    comment.answers.likedByUser = this.userHasLiked(comment.answers);
                    comment.answers.count = comment.numberOfLikers;
                    comment.answers.created = this.created(comment.answers);
                    comment.date = new Date(comment.date);
                    comment.created = this.created(comment);
                    comment.likedByUser = this.userHasLiked(comment);
                    comment.answers.user = this.authService.currentUser;
                    comment.count = comment.likers ? comment.likers.length : 0;
                    if (comment.thread) {
                        comment.thread.date = new Date(comment.thread.date);
                        comment.thread.likedByUser = this.userHasLiked(comment.thread);
                        comment.thread.count = comment.thread.likers ? comment.thread.likers.length : 0;
                    }
                    return comment;
                });
                this.answers = provisionalArray;
            }
            this.wait = false;
        }, (err) => {
            this.enableInfinite = true;
            this.authService.errorMessage = err;
            setTimeout(() => {
                this.authService.errorMessage = null;
            }, 5000);
            this.wait = false;
        });
    }
    followRelation() {
        if (this.authService.isLoggedIn()) {
            if (this.authService.currentUser.following.indexOf(this.user._id) >= 0) {
                this.user.provFollowing = true;
                this.user.loadingFollow = false;
            }
            else {
                this.user.provFollowing = false;
                this.user.loadingFollow = false;
            }
        }
        else {
            this.user.loadingFollow = false;
            this.user.provFollowing = false;
        }
    }
    followUser() {
        if (this.authService.isLoggedIn()) {
            if (!this.user.loadingFollow) {
                if (this.user.provFollowing) {
                    //Unfollow
                    this.user.provFollowing = false;
                    this.authService.currentUser.followingNumber -= 1;
                    this.user.followersNumber -= 1;
                    this.authService.currentUser.following = this.authService.currentUser.following.filter(element => element != this.user._id);
                    this.authService.unfollow(this.user._id)
                        .subscribe(() => {
                    }, (err) => {
                    });
                }
                else {
                    //Follow
                    this.user.provFollowing = true;
                    this.authService.currentUser.followingNumber += 1;
                    this.user.followersNumber += 1;
                    this.authService.currentUser.following.push(this.user._id);
                    this.authService.follow(this.user._id)
                        .subscribe(() => {
                        this.webSocketService.emitPost(null, "follow", this.user._id, this.authService.currentUser._id);
                    }, (err) => {
                        this.authService.errorMessage = err;
                        setTimeout(() => {
                            this.authService.errorMessage = null;
                        }, 5000);
                    });
                }
            }
        }
        else {
            //Mandar a signup
            this.authService.toggleAccess = true;
            this.authService.register = true;
            this.authService.toggleLogin = false;
        }
    }
    blockRelation() {
        if (this.authService.isLoggedIn()) {
            if (this.authService.currentUser.usersBlocked.indexOf(this.user._id) >= 0) {
                this.blocked = true;
            }
            else {
                this.blocked = false;
            }
        }
        else {
            this.blocked = false;
        }
    }
    setInitialSettings() {
        if (this.user.coverPhoto) {
            this.userBackground = {
                'background-image': 'url(' + this.user.coverPhoto + '',
                'background-repeat': 'no-repeat',
                'background-size': 'cover',
                'background-position': 'center',
                'padding-bottom': '40%'
            };
        }
        else {
            this.userBackground = {
                'background-color': '#4264d0',
                'background-repeat': 'no-repeat',
                'background-size': 'cover',
                'background-position': 'center',
                'padding-bottom': '40%'
            };
        }
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
    deleteTake(takeId) {
        this.takes = this.takes.filter(_take => _take._id !== takeId);
    }
    deleteThread(threadId) {
        this.threads = this.threads.filter(_thread => _thread._id !== threadId);
    }
    getThreads(league) {
        this.filterBy = league;
        if (!this.cached)
            this.wait = true;
        this.cached = true;
        this.authService.getOtherUserThreads(this.filterBy, 0, this.user._id, this.threadsService.leagues)
            .subscribe((threads) => {
            this.wait = false;
            if (threads.length >= 15) {
                this.enableInfinite = true;
            }
            else {
                this.enableInfinite = false;
            }
            if (threads.length > 0) {
                let provisionalArray = threads.map((thread) => {
                    thread.date = new Date(thread.date);
                    thread.created = this.created(thread);
                    thread.likedByUser = this.userHasLiked(thread);
                    thread.count = thread.likers ? thread.likers.length : 0;
                    thread.user = this.user;
                    return thread;
                });
                this.threads = provisionalArray;
            }
            else {
                this.threads = [];
            }
        }, (err) => {
            this.authService.errorMessage = err;
            setTimeout(() => {
                this.authService.errorMessage = null;
            }, 5000);
            this.wait = false;
        });
    }
    getTakes(league) {
        this.cached = true;
        this.filterBy = league;
        if (!this.cached)
            this.wait = true;
        ///
        this.authService.getOtherUserTakes(this.filterBy, 0, this.user._id, this.threadsService.leagues)
            .subscribe((takes) => {
            this.wait = false;
            if (takes.length >= 10) {
                this.enableInfinite = true;
            }
            else {
                this.enableInfinite = false;
            }
            if (takes.length > 0) {
                let provisionalArray = takes.map((take) => {
                    take.date = new Date(take.date);
                    take.created = this.created(take);
                    take.likedByUser = this.userHasLiked(take);
                    take.user = this.user;
                    take.count = take.likers ? take.likers.length : 0;
                    return take;
                });
                this.takes = provisionalArray;
            }
            else {
                this.takes = [];
            }
        }, (err) => {
            this.authService.errorMessage = err;
            setTimeout(() => {
                this.authService.errorMessage = null;
            }, 5000);
            this.wait = false;
        });
    }
    followers() {
        if (this.authService.isLoggedIn()) {
            let data = {
                userId: this.user._id,
                title: "Followers"
            };
            this.authService.paramSignUp = data;
            this.authService.followInfo = true;
        }
        else {
            //Mandar a signup
            this.authService.toggleAccess = true;
            this.authService.register = true;
            this.authService.toggleLogin = false;
        }
    }
    following() {
        if (this.authService.isLoggedIn()) {
            let data = {
                userId: this.user._id,
                title: "Following"
            };
            this.authService.paramSignUp = data;
            this.authService.followInfo = true;
        }
        else {
            //Mandar a signup
            this.authService.toggleAccess = true;
            this.authService.register = true;
            this.authService.toggleLogin = false;
        }
    }
    numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    getMorePosts(skip) {
        this.authService.getOtherUserThreads(this.filterBy, skip, this.user._id, this.threadsService.leagues)
            .subscribe((threads) => {
            if (threads.length < 15)
                this.enableInfinite = false;
            if (threads.length > 0) {
                let provisionalArray = threads.map((thread) => {
                    thread.date = new Date(thread.date);
                    thread.created = this.created(thread);
                    thread.count = thread.likers ? thread.likers.length : 0;
                    thread.user = this.user;
                    return thread;
                });
                this.threads = this.threads.concat(provisionalArray);
            }
            this.showInfiniteSpinner = false;
        }, (err) => {
            this.enableInfinite = true;
            this.showInfiniteSpinner = false;
            this.authService.errorMessage = err;
            setTimeout(() => {
                this.authService.errorMessage = null;
            }, 5000);
        });
    }
    getMoreTakes(skip) {
        this.authService.getOtherUserTakes(this.filterBy, skip, this.user._id, this.threadsService.leagues)
            .subscribe((takes) => {
            if (takes.length < 10)
                this.enableInfinite = false;
            if (takes.length > 0) {
                let provisionalArray = takes.map((take) => {
                    take.date = new Date(take.date);
                    take.created = this.created(take);
                    take.likedByUser = this.userHasLiked(take);
                    take.user = this.user;
                    take.count = take.likers ? take.likers.length : 0;
                    return take;
                });
                this.takes = this.takes.concat(provisionalArray);
            }
            this.showInfiniteSpinner = false;
        }, (err) => {
            this.enableInfinite = true;
            this.showInfiniteSpinner = false;
            this.authService.errorMessage = err;
            setTimeout(() => {
                this.authService.errorMessage = null;
            }, 5000);
        });
    }
    getMoreComments(skip) {
        this.authService.getUserThreadDiscussions(skip)
            .subscribe((comments) => {
            if (comments.length < 15)
                this.enableInfinite = false;
            if (comments.length > 0) {
                let provisionalArray = comments.map((comment) => {
                    comment.date = new Date(comment.date);
                    comment.user = this.authService.currentUser;
                    comment.created = this.created(comment);
                    if (comment.thread) {
                        comment.thread.date = new Date(comment.thread.date);
                        comment.thread.likedByUser = this.userHasLiked(comment.thread);
                        comment.thread.count = comment.thread.likers ? comment.thread.likers.length : 0;
                    }
                    return comment;
                });
                this.comments = this.comments.concat(provisionalArray);
            }
            this.showInfiniteSpinner = false;
        }, (err) => {
            this.enableInfinite = true;
            this.showInfiniteSpinner = false;
            this.authService.errorMessage = err;
            setTimeout(() => {
                this.authService.errorMessage = null;
            }, 5000);
        });
    }
    getMoreAnswers(skip) {
        this.authService.getUserThreadAnswers(skip)
            .subscribe((comments) => {
            if (comments.length < 15)
                this.enableInfinite = false;
            if (comments.length > 0) {
                let provisionalArray = comments.map((comment) => {
                    comment.answers.date = new Date(comment.answers.date);
                    comment.answers.created = this.created(comment.answers);
                    comment.answers.user = this.authService.currentUser;
                    if (comment.thread) {
                        comment.thread.date = new Date(comment.thread.date);
                        comment.thread.likedByUser = this.userHasLiked(comment.thread);
                        comment.thread.count = comment.thread.likers ? comment.thread.likers.length : 0;
                    }
                    return comment;
                });
                this.answers = this.answers.concat(provisionalArray);
            }
            this.showInfiniteSpinner = false;
        }, (err) => {
            this.enableInfinite = true;
            this.showInfiniteSpinner = false;
            this.authService.errorMessage = err;
            setTimeout(() => {
                this.authService.errorMessage = null;
            }, 5000);
        });
    }
    deleteComment(id) {
        this.comments = this.comments.filter(comment => comment._id != id);
    }
    toggleMore() {
        this.toggleEdit = !this.toggleEdit;
    }
    report() {
        this.toggleEdit = false;
        var why = prompt('Why are you reporting ' + this.user.username + '?');
        if (why === null) {
            return; //break out of the function early
        }
        this.authService.reportUser(this.user._id, why)
            .subscribe((user) => {
            alert('Thanks for reporting ' + this.user.username + '. Thanks to you we can make DTG a better community!');
        }, (err) => {
            this.authService.errorMessage = err;
            setTimeout(() => {
                this.authService.errorMessage = null;
            }, 5000);
        });
    }
    block() {
        this.toggleEdit = false;
        if (this.blocked) {
            confirm('Unblock ' + this.user.username + '? ' + "This person will be able to find your profile, your posts or your comments. DiscussTheGame will not warn this user that you unblocked it.");
            this.blocked = false;
            this.authService.currentUser.usersBlocked = this.authService.currentUser.usersBlocked.filter(element => element != this.user._id);
            this.authService.unblockUser(this.user._id)
                .subscribe(() => {
            }, (err) => {
                this.authService.errorMessage = err;
                setTimeout(() => {
                    this.authService.errorMessage = null;
                }, 5000);
            });
        }
        else {
            confirm('Block ' + this.user.username + '? ' + "This person will not be able to send you private messages, find your profile, your posts or your comments. DiscussTheGame will not warn this person that you blocked it.");
            if (this.user.provFollowing) {
                this.user.provFollowing = false;
                this.authService.currentUser.followingNumber -= 1;
                this.user.followersNumber -= 1;
                this.authService.currentUser.following = this.authService.currentUser.following.filter(element => element != this.user._id);
            }
            this.blocked = true;
            this.authService.currentUser.usersBlocked.push(this.user._id);
            this.authService.blockUser(this.user._id)
                .subscribe(() => {
            }, (err) => {
                this.authService.errorMessage = err;
                setTimeout(() => {
                    this.authService.errorMessage = null;
                }, 5000);
            });
        }
    }
    levelsInfo() {
        this.authService.levelsInfo = true;
    }
    displayBar() {
        let result;
        let top;
        let bottom;
        if (this.authService.currentUser.badge.level != 1) {
            top = this.authService.currentUser.totalPoints - this.authService.currentUser.badge.previousPoints;
            bottom = this.authService.currentUser.badge.nextPoints - this.authService.currentUser.badge.previousPoints;
            result = (top / bottom) * 100;
        }
        else {
            top = this.authService.currentUser.totalPoints;
            bottom = this.authService.currentUser.badge.nextPoints;
            result = (top / bottom) * 100;
        }
        return result;
    }
    deleteAnswer(id) {
        this.answers = this.answers.filter(comment => comment.answers._id != id);
    }
    doInfinite() {
        let path = this.router.url.split('/');
        if (this.threadsService.showInfiniteSpinner || path[1] != 'u')
            return;
        this.showInfiniteSpinner = true;
        if (this.postsBoolean) {
            this.skipPosts += 15;
            this.getMorePosts(this.skipPosts);
        }
        else if (this.takesBoolean) {
            this.skipTakes += 10;
            this.getMoreTakes(this.skipTakes);
        }
        else if (this.answersBoolean) {
            this.skipAnswers += 15;
            this.getMoreAnswers(this.skipAnswers);
        }
        else {
            this.skipComments += 15;
            this.getMoreComments(this.skipComments);
        }
    }
};
UserComponent = __decorate([
    Component({
        selector: 'app-user',
        templateUrl: './user.component.html',
        styleUrls: ['./user.component.scss']
    }),
    __param(5, Inject(PLATFORM_ID))
], UserComponent);
export { UserComponent };
//# sourceMappingURL=user.component.js.map