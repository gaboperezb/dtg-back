import { __decorate, __param } from "tslib";
import { Component, Inject } from '@angular/core';
import { NavigationStart, NavigationEnd } from '@angular/router';
import { globalCacheBusterNotifier } from 'ngx-cacheable';
import { Validators } from '@angular/forms';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
let AppComponent = class AppComponent {
    constructor(authService, router, platformId, stateService, seoSocialShareService, takeService, formBuilder, threadsService) {
        this.authService = authService;
        this.router = router;
        this.platformId = platformId;
        this.stateService = stateService;
        this.seoSocialShareService = seoSocialShareService;
        this.takeService = takeService;
        this.formBuilder = formBuilder;
        this.threadsService = threadsService;
        this.title = 'dtg-web';
        this.postsActive = false;
        this.dropDown = false;
        this.safari = false;
        this.toggleCreate = false;
        this.toggleSearch = false;
        this.seoRoutes = ['u', 'posts', 'discussions', 'featured'];
        if (isPlatformBrowser(this.platformId)) {
            document.body.addEventListener('click', () => {
                if (this.dropDown)
                    this.dropDown = false;
            });
        }
    }
    closeFullScreen() {
        this.takeService.fullScreen = false;
        this.takeService.fullScreenImage = "";
        this.stateService.unfreezeBody();
    }
    buildForm() {
        this.searchForm = this.formBuilder.group({
            search: ["", [Validators.required]]
        });
    }
    buildFormMobile() {
        this.searchFormMobile = this.formBuilder.group({
            search: ["", [Validators.required]]
        });
    }
    initializeEmbedly() {
        embedly("defaults", {
            cards: {
                key: '116e3e2241ba42e49a5d9091d51206dd',
                chrome: 0,
                controls: 0,
                recommend: 0
            }
        });
    }
    goToCreate(e, route) {
        this.toggleCreate = false;
        this.router.navigateByUrl(route);
    }
    checkRouterEvent() {
        this.router.events.subscribe(event => {
            if (event instanceof NavigationStart) {
                if (this.safari)
                    this.threadsService.transition = true;
            }
            if (event instanceof NavigationEnd) {
                console.log(event.url);
                let path = this.router.url.split('/');
                if (!this.seoRoutes.includes(path[1])) {
                    this.configureSEO();
                }
                ;
                if (this.safari) {
                    setTimeout(() => {
                        //bug scroll Safari
                        this.threadsService.transition = false;
                    }, 300);
                }
            }
        });
    }
    configureSEO() {
        let data = {
            title: "Discuss TheGame: The place for die-hard sports fans.",
            description: "Discuss TheGame is a community-powered platform for die-hard sports fans where users talk sports, create content, share their sports opinions, and chat and connect with fans.",
            site: 'http://localhost:3000/',
            image: "Https://discussthegame.s3-us-west-1.amazonaws.com/ui/dtg-share.png",
            large: true
        };
        this.seoSocialShareService.setData(data);
    }
    goAccess(type) {
        this.authService.toggleAccess = true;
        this.authService.register = true;
        if (type == 'login')
            this.authService.toggleLogin = true;
        else {
            this.authService.toggleLogin = false;
        }
    }
    checkBrowser() {
        if (isPlatformBrowser(this.platformId)) {
            var ua = navigator.userAgent.toLowerCase();
            if (ua.indexOf('safari') != -1) {
                if (ua.indexOf('chrome') > -1) {
                }
                else {
                    this.safari = true; // Safari
                }
            }
        }
    }
    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.initializeEmbedly();
            this.initializeApp();
            this.buildForm();
            this.buildFormMobile();
        }
    }
    initializeApp() {
        this.authService.checkAuthentication();
        this.checkBrowser();
        this.checkRouterEvent();
        this.threadsService.populateMenu();
        setTimeout(() => {
            globalCacheBusterNotifier.next();
        }, 2000);
    }
    toggleDropdown(e) {
        e.stopPropagation();
        e.preventDefault();
        this.dropDown = !this.dropDown;
    }
    logout() {
        var r = confirm("Do you want to logout?");
        if (r == true) {
            this.authService.logOut();
            this.router.navigateByUrl('/login');
        }
        else {
        }
    }
    submit(formValues) {
        let searchTerm = formValues.search;
        if (searchTerm.trim().length == 0)
            return;
        this.router.navigate(['/search'], { queryParams: { q: searchTerm, type: "best" } });
    }
};
AppComponent = __decorate([
    Component({
        selector: 'app-root',
        templateUrl: './app.component.html',
        styleUrls: ['./app.component.scss']
    }),
    __param(2, Inject(PLATFORM_ID))
], AppComponent);
export { AppComponent };
//# sourceMappingURL=app.component.js.map