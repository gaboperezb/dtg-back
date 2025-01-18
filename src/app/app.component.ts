import { Component, Inject } from '@angular/core';
import { AuthService } from './core/auth.service';
import { Route, Router, NavigationStart, NavigationEnd, Scroll } from '@angular/router';
import { ThreadsService } from './core/thread.service';
import { TakeService } from './core/take.service';
import { filter } from 'rxjs/operators';
import { ViewportScroller } from '@angular/common';
import { StateService } from './core/state.service';
import { globalCacheBusterNotifier } from 'ngx-cacheable';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { SeoSocialShareService } from './core/seo-social-share.service';

declare var embedly;

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent {
	title = 'dtg-web';
	postsActive: boolean = false;
	dropDown: boolean = false;
	safari: boolean = false;
	searchForm: FormGroup;
	searchFormMobile: FormGroup;
	toggleCreate: boolean = false;
	toggleSearch: boolean = false;
	seoRoutes: string[] = ['u', 'posts', 'discussions', 'featured'] 


	constructor(public authService: AuthService,
		public router: Router,
		@Inject(PLATFORM_ID) private platformId: Object,
		private stateService: StateService,
		private seoSocialShareService: SeoSocialShareService,
		public takeService: TakeService,
		private formBuilder: FormBuilder,
		public threadsService: ThreadsService) {


		if (isPlatformBrowser(this.platformId)) {
			document.body.addEventListener('click', () => {
				if (this.dropDown) this.dropDown = false;
			});
		}

	}

	closeFullScreen() {
		this.takeService.fullScreen = false;
		this.takeService.fullScreenImage = ""
		this.stateService.unfreezeBody()
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
		setTimeout(() => {
			embedly("defaults", {
				cards: {
					key: '116e3e2241ba42e49a5d9091d51206dd',
					chrome: 0,
					controls: 0,
					recommend: 0
				}
			});
		}, 3000);
	
	}


	goToCreate(e: any, route: string) {

		this.toggleCreate = false;
		this.router.navigateByUrl(route)
	}

	checkRouterEvent(): void {
		this.router.events.subscribe(event => {

			if (event instanceof NavigationStart) {
				if (this.safari) this.threadsService.transition = true
			}

			if (event instanceof NavigationEnd) {

			
				let path = this.router.url.split('/')
				if (!this.seoRoutes.includes(path[1])) {
					this.configureSEO()
				};

				if (this.safari) {
					if(isPlatformBrowser(this.platformId)) {
						setTimeout(() => {
							//bug scroll Safari
							this.threadsService.transition = false
						}, 300);
					}
					
				}
			}
		})
	}

	configureSEO() {
		
		let data = {
			title: "Discuss the Game: The place for die-hard sports fans.",
			description: "Discuss the Game is a community-powered platform for die-hard sports fans where users talk sports, create content, share their sports opinions, and chat and connect with fans.",
			site: 'https://www.discussthegame.com/',
			image: "Https://discussthegame.s3-us-west-1.amazonaws.com/ui/dtg-share.png",
			large: true
		}
		this.seoSocialShareService.setData(data)
	}


	goAccess(type: string) {
		this.authService.toggleAccess = true;
		this.authService.register = true;
	
		if (type == 'login') this.authService.toggleLogin = true;
		else {
			this.authService.toggleLogin = false;
		}

	}

	checkBrowser() {

		if (isPlatformBrowser(this.platformId)) {
			var ua = navigator.userAgent.toLowerCase();
			if (ua.indexOf('safari') != -1) {
				if (ua.indexOf('chrome') > -1) {
				} else {
					this.safari = true // Safari
				}
			}
		}

	}

	ngOnInit() {
		
		if (isPlatformBrowser(this.platformId)) {
			this.initializeEmbedly()
			this.initializeApp()
			this.buildForm()
			this.buildFormMobile()
		 }
	}

	initializeApp() {
		this.authService.checkAuthentication();
		this.checkBrowser()
		this.checkRouterEvent()
		this.threadsService.populateMenu()
		setTimeout(() => {
			globalCacheBusterNotifier.next()
		}, 2000);

	}

	toggleDropdown(e) {
		e.stopPropagation();
		e.preventDefault()
		this.dropDown = !this.dropDown;
	}

	logout() {

		var r = confirm("Do you want to logout?");
		if (r == true) {
			this.authService.logOut()
			this.router.navigateByUrl('/login')
		} else {

		}

	}


	submit(formValues: any) {

		let searchTerm = formValues.search;
		if (searchTerm.trim().length == 0) return;
		this.router.navigate(['/search'], { queryParams: { q: searchTerm, type: "best" } });

	}

}
